import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { InvitationService } from './invitation.service.js'
import { RevokePartyLinkService } from './revoke-party-link.service.js'

const ownerEmail = `party-link-owner-${Date.now()}@example.com`
const otherEmail = `party-link-other-${Date.now()}@example.com`

describe('RevokePartyLinkService', () => {
  const invitations = new InvitationService()
  const links = new GuestLinkService()
  const revoke = new RevokePartyLinkService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('revokes one party link and leaves the other party working', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await invitations.createProject(owner.id, 'One link')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const lan = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'ROSTER', displayName: 'Lan' },
    })
    const hoa = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'ROSTER', displayName: 'Hoa' },
    })
    const handle = await prisma.invitationHandle.findFirstOrThrow({
      where: { invitationId: created.id, revokedAt: null },
    })
    const lanSecret = await links.issue(owner.id, created.id, lan.id)
    const hoaSecret = await links.issue(owner.id, created.id, hoa.id)
    const lanSession = await links.exchange(handle.slug, lanSecret)
    const before = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })

    await expect(revoke.revoke(other.id, lan.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      revoke.revoke(owner.id, lan.id, '00000000-0000-4000-8000-000000000099'),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect((await revoke.revoke(owner.id, lan.id, created.id)).linkVersion).toBe(1)
    const after = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    expect(after.accessEpoch).toBe(before.accessEpoch)
    expect((await prisma.guestParty.findUniqueOrThrow({ where: { id: hoa.id } })).linkVersion).toBe(0)
    await expect(links.exchange(handle.slug, lanSecret)).rejects.toBeInstanceOf(NotFoundException)
    await expect(links.readSession(handle.slug, lanSession.sessionToken)).rejects.toBeInstanceOf(
      NotFoundException,
    )
    expect((await links.exchange(handle.slug, hoaSecret)).partyName).toBe('Hoa')
  })
})