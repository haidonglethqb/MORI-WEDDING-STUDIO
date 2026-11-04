import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpExportService } from './rsvp-export.service.js'
import { RsvpListService } from './rsvp-list.service.js'
import { RsvpService } from './rsvp.service.js'

const ownerEmail = `export-owner-${Date.now()}@example.com`
const staffEmail = `export-staff-${Date.now()}@example.com`
const internalNote = `ivory-hidden-${Date.now()}`

describe('RsvpExportService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const exporter = new RsvpExportService(new RsvpListService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('exports guest answers only for the owner or staff with RSVP permission', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', role: 'CUSTOMER' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO' },
    })
    const project = await invitations.createProject(owner.id, 'Export')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan, Hoa' },
    })
    await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: owner.id,
        visibility: 'INTERNAL',
        plainText: internalNote,
      },
    })
    await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id, rsvpAccess: false },
    })

    await expect(exporter.exportCsv(staff.id, created.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(await prisma.rsvpExportAudit.count({ where: { invitationId: created.id } })).toBe(0)

    const csv = await exporter.exportCsv(owner.id, created.id)
    expect(csv).toBe('partyName,status,attendeeCount\n"Lan, Hoa",ATTENDING,2')
    expect(csv.includes(internalNote)).toBe(false)
    expect(csv.includes(ownerEmail)).toBe(false)
    expect(await prisma.rsvpExportAudit.count({ where: { invitationId: created.id, actorUserId: owner.id } })).toBe(1)

    await prisma.staffAssignment.updateMany({
      where: { projectId: project.id, staffUserId: staff.id },
      data: { rsvpAccess: true },
    })
    const staffCsv = await exporter.exportCsv(staff.id, created.id)
    expect(staffCsv).toBe(csv)
    expect(await prisma.rsvpExportAudit.count({ where: { invitationId: created.id } })).toBe(2)

    const formulaParty = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: '=SUM(1,2)' },
    })
    await rsvp.submit({
      partyId: formulaParty.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'DECLINED',
      attendeeCount: 0,
    })
    const safeCsv = await exporter.exportCsv(owner.id, created.id)
    expect(safeCsv).toContain('"\'=SUM(1,2)",DECLINED,0')
  })
})