import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from '../invitations/invitation.service.js'
import { MediaDeleteService } from './media-delete.service.js'

const email = `media-delete-${Date.now()}@example.com`

describe('MediaDeleteService', () => {
  const invitations = new InvitationService()
  const media = new MediaDeleteService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps files used by a publication or an approved proof', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Media')
    const cover = await prisma.mediaAsset.create({
      data: {
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'cover',
        checksum: 'cover-checksum',
        state: 'READY',
        isFixture: true,
      },
    })
    const proofFile = await prisma.mediaAsset.create({
      data: {
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'proof',
        checksum: 'proof-checksum',
        state: 'READY',
        isFixture: true,
      },
    })
    const draftFile = await prisma.mediaAsset.create({
      data: {
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'draft',
        checksum: 'draft-checksum',
        state: 'READY',
        isFixture: true,
      },
    })
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Tiệc',
        coverAssetId: cover.id,
      },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'proof-hash',
        mediaAssetId: proofFile.id,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'proof-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 2,
        state: 'WORKING',
        manifestHash: 'draft-hash',
        mediaAssetId: draftFile.id,
        isFixture: true,
      },
    })

    await expect(media.delete(owner.id, cover.id)).rejects.toMatchObject({ response: { code: 'ASSET_IN_USE' } })
    await expect(media.delete(owner.id, proofFile.id)).rejects.toMatchObject({ response: { code: 'ASSET_IN_USE' } })
    expect(await prisma.mediaAsset.count({ where: { id: { in: [cover.id, proofFile.id] } } })).toBe(2)

    await media.delete(owner.id, draftFile.id)
    expect(await prisma.mediaAsset.findUnique({ where: { id: draftFile.id } })).toBeNull()
    expect((await prisma.designRevision.findFirstOrThrow({
      where: { requestId: request.id, sequence: 2 },
    })).mediaAssetId).toBeNull()
  })
})