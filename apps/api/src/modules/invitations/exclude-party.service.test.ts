import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ExcludePartyService } from './exclude-party.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const ownerEmail = `exclude-owner-${Date.now()}@example.com`
const otherEmail = `exclude-other-${Date.now()}@example.com`

describe('ExcludePartyService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const exclude = new ExcludePartyService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps the old answer and frees the seat after exclusion', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await invitations.createProject(owner.id, 'Duplicates')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    await prisma.invitationEvent.update({ where: { id: event.id }, data: { capacity: 2 } })
    const lan = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const hoa = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Hoa' },
    })
    await rsvp.submit({
      partyId: lan.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    await expect(
      rsvp.submit({
        partyId: hoa.id,
        eventId: event.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    await expect(exclude.exclude(owner.id, lan.id, '   ')).rejects.toBeInstanceOf(ConflictException)
    await expect(exclude.exclude(other.id, lan.id, 'Trùng tên')).rejects.toBeInstanceOf(NotFoundException)
    await exclude.exclude(owner.id, lan.id, 'Cùng một khách gửi hai lần')

    const stored = await prisma.guestParty.findUniqueOrThrow({ where: { id: lan.id } })
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({
      where: { eventId: event.id, response: { partyId: lan.id } },
    })
    expect(stored.excludedAt).toBeTruthy()
    expect(stored.exclusionReason).toBe('Cùng một khách gửi hai lần')
    expect(answer.attendeeCount).toBe(2)
    await expect(
      rsvp.submit({
        partyId: lan.id,
        eventId: event.id,
        expectedVersion: 1,
        status: 'DECLINED',
        attendeeCount: 0,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    const accepted = await rsvp.submit({
      partyId: hoa.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })
    expect(accepted.version).toBe(1)
  })
})