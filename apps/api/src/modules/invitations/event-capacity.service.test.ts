import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { EventCapacityService } from './event-capacity.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const ownerEmail = `capacity-owner-${Date.now()}@example.com`
const otherEmail = `capacity-other-${Date.now()}@example.com`

describe('EventCapacityService', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()
  const capacity = new EventCapacityService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('rejects a lower cap and keeps the accepted guests', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await invitations.createProject(owner.id, 'Capacity edit')
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
      attendeeCount: 3,
    })

    await expect(capacity.setCapacity(other.id, event.id, 10)).rejects.toBeInstanceOf(NotFoundException)
    await expect(capacity.setCapacity(owner.id, event.id, 2)).rejects.toMatchObject({
      response: { code: 'EVENT_CAPACITY_EXCEEDED', accepted: 3 },
    })
    expect((await prisma.invitationEvent.findUniqueOrThrow({ where: { id: event.id } })).capacity).toBeNull()
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })
    expect(answer.attendeeCount).toBe(3)

    await capacity.setCapacity(owner.id, event.id, 3)
    expect((await prisma.invitationEvent.findUniqueOrThrow({ where: { id: event.id } })).capacity).toBe(3)
    await capacity.setCapacity(owner.id, event.id, null)
    expect((await prisma.invitationEvent.findUniqueOrThrow({ where: { id: event.id } })).capacity).toBeNull()
  })
})