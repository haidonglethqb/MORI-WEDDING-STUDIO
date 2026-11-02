import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { EventDeleteService } from './event-delete.service.js'
import { EventRetireService } from './event-retire.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `event-delete-${Date.now()}@example.com`

describe('EventDeleteService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const remove = new EventDeleteService()
  const retire = new EventRetireService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps an event that already has an answer', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Keep event')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const reception = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const empty = await prisma.invitationEvent.create({
      data: { invitationId: created.id, stableEventKey: 'empty', title: 'Chưa có khách' },
    })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    await rsvp.submit({
      partyId: party.id,
      eventId: reception.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })

    await expect(remove.remove(owner.id, reception.id)).rejects.toBeInstanceOf(ConflictException)
    expect(await prisma.invitationEvent.findUnique({ where: { id: reception.id } })).toBeTruthy()
    expect((await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: reception.id } })).attendeeCount).toBe(
      2,
    )

    await remove.remove(owner.id, empty.id)
    expect(await prisma.invitationEvent.findUnique({ where: { id: empty.id } })).toBeNull()
    expect((await retire.retire(owner.id, reception.id)).preservedAnswers).toBe(1)
    expect((await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: reception.id } })).attendeeCount).toBe(
      2,
    )
  })
})