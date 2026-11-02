import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { InvitationService } from './invitation.service.js'
import { RevokeGuestAccessService } from './revoke-guest-access.service.js'

const email = `revoke-guests-${Date.now()}@example.com`

describe('RevokeGuestAccessService', () => {
  const invitations = new InvitationService()
  const links = new GuestLinkService()
  const revoke = new RevokeGuestAccessService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('invalidates existing guest links and keeps the invitation published', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Revoke guests')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'ROSTER', displayName: 'Lan' },
    })
    const handle = await prisma.invitationHandle.findFirstOrThrow({
      where: { invitationId: created.id, revokedAt: null },
    })
    const secret = await links.issue(owner.id, created.id, party.id)
    const opened = await links.exchange(handle.slug, secret)
    expect((await links.readSession(handle.slug, opened.sessionToken)).partyName).toBe('Lan')
    const published = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })

    await expect(revoke.revokeAll({
      ownerUserId: owner.id,
      invitationId: created.id,
      expectedVersion: published.draftVersion,
      idempotencyKey: 'revoke-once',
      confirm: false,
    })).rejects.toBeInstanceOf(ConflictException)
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).accessEpoch).toBe(
      published.accessEpoch,
    )

    const first = await revoke.revokeAll({
      ownerUserId: owner.id,
      invitationId: created.id,
      expectedVersion: published.draftVersion,
      idempotencyKey: 'revoke-once',
      confirm: true,
    })
    const replay = await revoke.revokeAll({
      ownerUserId: owner.id,
      invitationId: created.id,
      expectedVersion: published.draftVersion,
      idempotencyKey: 'revoke-once',
      confirm: true,
    })
    expect(replay.accessEpoch).toBe(first.accessEpoch)
    expect(first.accessEpoch).toBe(published.accessEpoch + 1)
    await expect(links.exchange(handle.slug, secret)).rejects.toBeInstanceOf(NotFoundException)
    await expect(links.readSession(handle.slug, opened.sessionToken)).rejects.toBeInstanceOf(NotFoundException)
    const page = await invitations.readPublished(handle.slug)
    expect('eventTitle' in page && page.eventTitle).toBe('Tiệc')
    const replacement = await links.issue(owner.id, created.id, party.id)
    expect((await links.exchange(handle.slug, replacement)).partyName).toBe('Lan')
  })
})