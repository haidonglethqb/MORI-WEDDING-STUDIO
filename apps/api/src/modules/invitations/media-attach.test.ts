import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'

const ownerEmail = `media-owner-${Date.now()}@example.com`
const otherEmail = `media-other-${Date.now()}@example.com`

describe('cover asset ownership', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.user.deleteMany({ where: { normalizedEmail: { in: [ownerEmail, otherEmail] } } })
    await disconnectPrismaClient()
  })

  it('rejects another customer asset and hides the id from the public page', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await invitations.createProject(owner.id, 'Photos')
    const otherProject = await invitations.createProject(other.id, 'Other photos')
    const created = await invitations.createInvitation(owner.id, project.id)
    const foreign = await prisma.mediaAsset.create({
      data: {
        ownerUserId: other.id,
        projectId: otherProject.id,
        purpose: 'cover',
        checksum: 'foreign',
        isFixture: true,
      },
    })
    const own = await prisma.mediaAsset.create({
      data: {
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'cover',
        checksum: 'own',
        isFixture: true,
      },
    })
    const base = {
      schemaVersion: 1 as const,
      displayNames: ['Mai', 'An'] as [string, string],
      eventTitle: 'Lễ cưới',
    }
    await expect(
      invitations.saveDraft(owner.id, created.id, {
        expectedVersion: 0,
        content: { ...base, coverAssetId: foreign.id },
      }),
    ).rejects.toBeInstanceOf(NotFoundException)

    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { ...base, coverAssetId: own.id },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const live = await invitations.readPublished(handle.slug)
    if (!('displayNames' in live)) throw new Error('expected an open invitation')
    expect(JSON.stringify(live)).not.toContain(own.id)
    expect(live.displayNames).toEqual(['Mai', 'An'])
  })
})