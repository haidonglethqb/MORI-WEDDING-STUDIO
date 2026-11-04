import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `rsvp-deadline-${Date.now()}@example.com`

describe('RSVP deadline', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('rejects a guest update after the database deadline and still returns the saved answer', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Deadline')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Tiệc',
      },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    await prisma.$executeRaw`
      UPDATE invitations
      SET "rsvpDeadlineAt" = NOW() + interval '1 day'
      WHERE id = ${created.id}::uuid
    `
    const accepted = await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
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
        status: 'DECLINED',
        attendeeCount: 0,
      }),
    ).rejects.toMatchObject({ response: { code: 'RSVP_CLOSED' } })

    expect(await rsvp.read(party.id)).toEqual({ version: accepted.version, attendeeCount: 2 })
  })
})