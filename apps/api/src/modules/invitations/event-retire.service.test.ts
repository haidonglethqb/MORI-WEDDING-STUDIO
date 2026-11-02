import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { EventRetireService } from './event-retire.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const ownerEmail = `retire-owner-${Date.now()}@example.com`
const otherEmail = `retire-other-${Date.now()}@example.com`

describe('EventRetireService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const retire = new EventRetireService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('retires an event and keeps the accepted answer', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await invitations.createProject(owner.id, 'Retire')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    await rsvp.submit({
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })

    await expect(retire.retire(other.id, event.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      retire.retire(owner.id, event.id, '00000000-0000-4000-8000-000000000099'),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect((await retire.retire(owner.id, event.id, created.id)).preservedAnswers).toBe(1)

    const stored = await prisma.invitationEvent.findUniqueOrThrow({ where: { id: event.id } })
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })
    expect(stored.retiredAt).toBeTruthy()
    expect(answer.attendeeCount).toBe(2)
    expect(answer.status).toBe('ATTENDING')
    await expect(
      rsvp.submit({
        partyId: party.id,
        eventId: event.id,
        expectedVersion: 1,
        status: 'DECLINED',
        attendeeCount: 0,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect((await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })).attendeeCount).toBe(2)
  })
})