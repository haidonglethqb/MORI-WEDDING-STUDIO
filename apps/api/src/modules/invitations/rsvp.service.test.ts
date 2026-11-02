import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `rsvp-${Date.now()}@example.com`

describe('RsvpService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('lets exactly one of two guests take the last place', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Capacity')
    const created = await invitations.createInvitation(owner.id, project.id)
    const content = {
      schemaVersion: 1 as const,
      displayNames: ['Mai', 'An'] as [string, string],
      eventTitle: 'Tiệc',
    }
    const saved = await invitations.saveDraft(owner.id, created.id, { expectedVersion: 0, content })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    await prisma.invitationEvent.update({ where: { id: event.id }, data: { capacity: 1 } })
    const [first, second] = await Promise.all([
      prisma.guestParty.create({
        data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
      }),
      prisma.guestParty.create({
        data: { invitationId: created.id, source: 'OPEN', displayName: 'Hoa' },
      }),
    ])

    const results = await Promise.allSettled([
      rsvp.submit({
        partyId: first.id,
        eventId: event.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
      rsvp.submit({
        partyId: second.id,
        eventId: event.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
    ])
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException)

    const answers = await prisma.rsvpEventAnswer.findMany({ where: { eventId: event.id } })
    const attending = answers
      .filter((answer) => answer.status === 'ATTENDING')
      .reduce((sum, answer) => sum + answer.attendeeCount, 0)
    expect(attending).toBe(1)
  })
})