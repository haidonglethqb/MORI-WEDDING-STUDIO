import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'
import { SwitchRsvpModeService } from './switch-rsvp-mode.service.js'

const email = `guest-list-${Date.now()}@example.com`

describe('SwitchRsvpModeService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const modes = new SwitchRsvpModeService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps open answers and stops open guests from writing', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Guest list mode')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const openParty = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const named = await prisma.guestParty.create({
      data: {
        invitationId: created.id,
        source: 'ROSTER',
        displayName: 'Hoa',
        allowances: { create: { eventId: event.id, maxAttendees: 2 } },
      },
    })
    const accepted = await rsvp.submit({
      partyId: openParty.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })

    await expect(modes.toGuestList(owner.id, created.id, false)).rejects.toBeInstanceOf(ConflictException)
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).rsvpMode).toBe('OPEN')

    await modes.toGuestList(owner.id, created.id, true)
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({
      where: { eventId: event.id, response: { partyId: openParty.id } },
    })
    expect(answer.attendeeCount).toBe(2)
    expect(await prisma.rsvpModeAudit.count({ where: { invitationId: created.id, nextMode: 'GUEST_LIST' } })).toBe(1)
    await expect(
      rsvp.submit({
        partyId: openParty.id,
        eventId: event.id,
        expectedVersion: accepted.version,
        status: 'DECLINED',
        attendeeCount: 0,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(
      (await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { response: { partyId: openParty.id } } })).attendeeCount,
    ).toBe(2)

    const namedAnswer = await rsvp.submit({
      partyId: named.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 1,
    })
    expect(namedAnswer.version).toBe(1)
  })
})