import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { digestToken } from '../identity/session-token.js'
import { GuestLinkService } from './guest-link.service.js'
import { InvitationService } from './invitation.service.js'

const email = `guest-link-${Date.now()}@example.com`

describe('GuestLinkService', () => {
  const invitations = new InvitationService()
  const links = new GuestLinkService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('opens only the named party and stores a digest', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner', invitationQuota: 2 },
    })
    const project = await invitations.createProject(owner.id, 'Links')
    const first = await publish(owner.id, project.id, 'Tiệc Lan')
    const second = await publish(owner.id, project.id, 'Tiệc khác')
    const lan = await prisma.guestParty.create({
      data: { invitationId: first.id, source: 'ROSTER', displayName: 'Lan' },
    })
    await prisma.guestParty.create({
      data: { invitationId: first.id, source: 'ROSTER', displayName: 'Hoa' },
    })
    const other = await prisma.guestParty.create({
      data: { invitationId: second.id, source: 'ROSTER', displayName: 'Mai' },
    })
    await prisma.invitation.update({
      where: { id: first.id },
      data: { accessMode: 'PASSCODE', passcodeHash: 'not-the-guest-secret' },
    })

    const secret = await links.issue(owner.id, first.id, lan.id)
    const stored = await prisma.guestGrant.findFirstOrThrow({ where: { partyId: lan.id } })
    expect(stored.tokenDigest).toBe(digestToken(secret))
    expect(stored.tokenDigest).not.toBe(secret)
    expect(JSON.stringify(stored)).not.toContain(secret)

    const firstHandle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: first.id } })
    const secondHandle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: second.id } })
    const opened = await links.exchange(firstHandle.slug, secret)
    expect(opened.partyName).toBe('Lan')
    expect(opened.sessionToken).not.toBe(secret)
    expect(await links.readSession(firstHandle.slug, opened.sessionToken)).toMatchObject({
      partyName: 'Lan',
      eventTitle: 'Tiệc Lan',
    })
    await expect(links.readSession(firstHandle.slug, secret)).rejects.toBeInstanceOf(NotFoundException)
    await expect(links.exchange(firstHandle.slug, 'wrong-secret')).rejects.toBeInstanceOf(NotFoundException)
    await expect(links.exchange(secondHandle.slug, secret)).rejects.toBeInstanceOf(NotFoundException)
    await expect(links.issue(owner.id, second.id, lan.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(other.displayName).toBe('Mai')

    await prisma.invitation.update({ where: { id: first.id }, data: { accessEpoch: { increment: 1 } } })
    await expect(links.exchange(firstHandle.slug, secret)).rejects.toBeInstanceOf(NotFoundException)
  })
})

async function publish(ownerId: string, projectId: string, eventTitle: string) {
  const invitations = new InvitationService()
  const created = await invitations.createInvitation(ownerId, projectId)
  const saved = await invitations.saveDraft(ownerId, created.id, {
    expectedVersion: 0,
    content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle },
  })
  await invitations.publish(ownerId, created.id, saved.version)
  return created
}
