import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `allowance-${Date.now()}@example.com`

describe('party event allowance', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('rejects an event the party was not invited to and a count above the allowance', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Allowance')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const reception = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const ceremony = await prisma.invitationEvent.create({
      data: { invitationId: created.id, stableEventKey: 'ceremony', title: 'Lễ' },
    })
    const party = await prisma.guestParty.create({
      data: {
        invitationId: created.id,
        source: 'ROSTER',
        displayName: 'Lan',
        allowances: { create: { eventId: reception.id, maxAttendees: 2 } },
      },
    })

    await expect(
      rsvp.submit({
        partyId: party.id,
        eventId: ceremony.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      rsvp.submit({
        partyId: party.id,
        eventId: reception.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 3,
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(await prisma.rsvpResponse.count({ where: { partyId: party.id } })).toBe(0)

    const accepted = await rsvp.submit({
      partyId: party.id,
      eventId: reception.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    await expect(
      rsvp.submit({
        partyId: party.id,
        eventId: reception.id,
        expectedVersion: accepted.version,
        status: 'ATTENDING',
        attendeeCount: 3,
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({
      where: { eventId: reception.id, response: { partyId: party.id } },
    })
    expect(answer.attendeeCount).toBe(2)
    expect(answer.responseId).toBeTruthy()
  })
})