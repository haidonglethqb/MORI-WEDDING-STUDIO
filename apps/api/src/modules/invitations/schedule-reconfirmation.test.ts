import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `reconfirm-${Date.now()}@example.com`
const base = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Tiệc',
  eventLocalStart: '20270601T180000',
  timeZone: 'Asia/Ho_Chi_Minh',
}

describe('schedule reconfirmation', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps the reserved count and asks the guest to confirm a new time', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Reconfirm')
    const created = await invitations.createInvitation(owner.id, project.id)
    const firstDraft = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: base,
    })
    await invitations.publish(owner.id, created.id, firstDraft.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    await prisma.invitationEvent.update({ where: { id: event.id }, data: { capacity: 2 } })
    const lan = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const hoa = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Hoa' },
    })
    const accepted = await rsvp.submit({
      partyId: lan.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })

    const moved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: firstDraft.version + 1,
      content: { ...base, eventLocalStart: '20270601T190000' },
    })
    await invitations.publish(owner.id, created.id, moved.version)
    const marked = await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })
    expect(marked.attendeeCount).toBe(2)
    expect(marked.needsReconfirmation).toBe(true)
    await expect(
      rsvp.submit({
        partyId: hoa.id,
        eventId: event.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    const confirmed = await rsvp.submit({
      partyId: lan.id,
      eventId: event.id,
      expectedVersion: accepted.version,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    expect(confirmed.version).toBe(accepted.version + 1)
    expect(
      (await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id, response: { partyId: lan.id } } }))
        .needsReconfirmation,
    ).toBe(false)

    const renamed = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: moved.version + 1,
      content: { ...base, eventLocalStart: '20270601T190000', eventTitle: 'Tiệc tối' },
    })
    await invitations.publish(owner.id, created.id, renamed.version)
    expect(
      (await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id, response: { partyId: lan.id } } }))
        .needsReconfirmation,
    ).toBe(false)
  })
})