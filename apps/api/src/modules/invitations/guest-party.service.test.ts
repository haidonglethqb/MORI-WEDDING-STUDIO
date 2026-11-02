import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { GuestPartyService } from './guest-party.service.js'
import { InvitationService } from './invitation.service.js'

const ownerEmail = `party-owner-${Date.now()}@example.com`
const otherEmail = `party-other-${Date.now()}@example.com`

describe('guest party links', () => {
  const invitations = new InvitationService()
  const parties = new GuestPartyService(new GuestLinkService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('creates a roster party and shows the guest secret only once', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const project = await invitations.createProject(owner.id, 'Party secret')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)

    await expect(
      parties.create({
        ownerUserId: other.id,
        invitationId: created.id,
        displayName: 'Lan',
        maxAttendees: 2,
        idempotencyKey: 'party-other',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)

    const party = await parties.create({
      ownerUserId: owner.id,
      invitationId: created.id,
      displayName: 'Lan',
      maxAttendees: 2,
      idempotencyKey: 'party-1',
    })
    const replay = await parties.create({
      ownerUserId: owner.id,
      invitationId: created.id,
      displayName: 'Lan',
      maxAttendees: 2,
      idempotencyKey: 'party-1',
    })
    expect(replay).toEqual(party)
    expect(JSON.stringify(party)).not.toContain('Party secret')

    const first = await parties.issueLink({
      ownerUserId: owner.id,
      invitationId: created.id,
      partyId: party.partyId,
      idempotencyKey: 'link-1',
    })
    expect(first.token).toBeTruthy()
    expect(first.guestPath).toContain('#guest=')
    const second = await parties.issueLink({
      ownerUserId: owner.id,
      invitationId: created.id,
      partyId: party.partyId,
      idempotencyKey: 'link-1',
    })
    expect(second).toEqual({ issued: true })
    expect(JSON.stringify(second)).not.toContain(first.token ?? '')
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const opened = await new GuestLinkService().exchange(handle.slug, first.token ?? '')
    expect(opened.partyName).toBe('Lan')
  })
})
