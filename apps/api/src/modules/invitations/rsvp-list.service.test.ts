import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProjectAccessService } from '../projects/project-access.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpListService } from './rsvp-list.service.js'
import { RsvpService } from './rsvp.service.js'

const ownerEmail = `rsvp-owner-${Date.now()}@example.com`
const staffEmail = `rsvp-staff-${Date.now()}@example.com`

describe('RsvpListService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const lists = new RsvpListService()
  const projects = new ProjectAccessService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('hides guest responses from assigned staff who lack RSVP permission', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', role: 'CUSTOMER' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO' },
    })
    const project = await invitations.createProject(owner.id, 'Guest list')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const party = await prisma.guestParty.create({
      data: {
        invitationId: created.id,
        source: 'ROSTER',
        displayName: 'Lan',
        allowances: { create: { eventId: event.id, maxAttendees: 2 } },
      },
    })
    await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id, rsvpAccess: false },
    })

    expect((await projects.read(staff.id, project.id)).internalTitle).toBe('Guest list')
    await expect(lists.list(staff.id, created.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(await lists.list(owner.id, created.id)).toEqual([
      { partyId: party.id, partyName: 'Lan', eventId: event.id, version: 1, status: 'ATTENDING', attendeeCount: 2, excluded: false },
    ])

    await prisma.staffAssignment.updateMany({
      where: { projectId: project.id, staffUserId: staff.id },
      data: { rsvpAccess: true },
    })
    expect(await lists.list(staff.id, created.id)).toEqual([
      { partyId: party.id, partyName: 'Lan', eventId: event.id, version: 1, status: 'ATTENDING', attendeeCount: 2, excluded: false },
    ])
  })
})