import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { OwnerRsvpService } from './owner-rsvp.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `owner-rsvp-${Date.now()}@example.com`

describe('OwnerRsvpService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const owners = new OwnerRsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('records an owner correction after the RSVP deadline', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Owner edit')
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
    await expect(
      owners.correct({
        ownerUserId: owner.id,
        partyId: party.id,
        eventId: event.id,
        expectedVersion: accepted.version,
        status: 'DECLINED',
        attendeeCount: 0,
        reason: '   ',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    const corrected = await owners.correct({
      ownerUserId: owner.id,
      partyId: party.id,
      eventId: event.id,
      expectedVersion: accepted.version,
      status: 'DECLINED',
      attendeeCount: 0,
      reason: 'Khách báo nhầm số người',
    })
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })
    const edit = await prisma.rsvpOwnerEdit.findFirstOrThrow({ where: { partyId: party.id } })
    expect(corrected.version).toBe(accepted.version + 1)
    expect(answer.status).toBe('DECLINED')
    expect(answer.attendeeCount).toBe(0)
    expect(edit.reason).toBe('Khách báo nhầm số người')
    expect(edit.previousStatus).toBe('ATTENDING')
    expect(edit.previousCount).toBe(2)
    expect(edit.ownerUserId).toBe(owner.id)
    expect(await rsvp.read(party.id)).toEqual({ version: corrected.version, attendeeCount: 0 })
  })
})