import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { ReopenRsvpService } from './reopen-rsvp.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `reopen-${Date.now()}@example.com`

describe('ReopenRsvpService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const reopen = new ReopenRsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('reopens a closed RSVP only with a deadline before the event', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Reopen')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    await prisma.invitationEvent.update({
      where: { id: event.id },
      data: { localStart: '20270601T180000', timeZone: 'Asia/Ho_Chi_Minh' },
    })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const accepted = await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 1,
    })
    await prisma.$executeRaw`
      UPDATE invitations
      SET "rsvpDeadlineAt" = NOW() - interval '1 second'
      WHERE id = ${created.id}::uuid
    `
    await expect(
      rsvp.submit({
        partyId: party.id,
        eventId: event.id,
        expectedVersion: accepted.version,
        status: 'ATTENDING',
        attendeeCount: 2,
      }),
    ).rejects.toMatchObject({ response: { code: 'RSVP_CLOSED' } })

    await expect(reopen.reopen(owner.id, created.id, new Date('2028-01-01T00:00:00.000Z'))).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect(await prisma.rsvpPolicyAudit.count({ where: { invitationId: created.id } })).toBe(0)

    const nextDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await reopen.reopen(owner.id, created.id, nextDeadline)
    const audit = await prisma.rsvpPolicyAudit.findFirstOrThrow({ where: { invitationId: created.id } })
    expect(audit.action).toBe('REOPENED')
    expect(audit.ownerUserId).toBe(owner.id)
    expect(audit.nextDeadline.toISOString()).toBe(nextDeadline.toISOString())

    const updated = await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: accepted.version,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    expect(updated.version).toBe(accepted.version + 1)
  })
})