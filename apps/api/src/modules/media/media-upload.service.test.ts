import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { MediaUploadService } from './media-upload.service.js'

const ownerEmail = `upload-owner-${Date.now()}@example.com`
const otherEmail = `upload-other-${Date.now()}@example.com`
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

describe('media upload sessions', () => {
  const uploads = new MediaUploadService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps a finished image owned by the project and rejects a replacement', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Upload secret' },
    })
    await expect(
      uploads.open({
        ownerUserId: other.id,
        projectId: project.id,
        purpose: 'cover',
        expectedBytes: png.length,
        declaredMime: 'image/png',
        idempotencyKey: 'upload-other',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      uploads.open({
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'cover',
        expectedBytes: 10_485_761,
        declaredMime: 'image/png',
        idempotencyKey: 'upload-big',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)

    const opened = await uploads.open({
      ownerUserId: owner.id,
      projectId: project.id,
      purpose: 'cover',
      expectedBytes: png.length,
      declaredMime: 'image/png',
      idempotencyKey: 'upload-1',
    })
    const replay = await uploads.open({
      ownerUserId: owner.id,
      projectId: project.id,
      purpose: 'cover',
      expectedBytes: png.length,
      declaredMime: 'image/png',
      idempotencyKey: 'upload-1',
    })
    expect(replay.uploadId).toBe(opened.uploadId)
    expect(opened.stagingKey).not.toBe(opened.uploadId)

    const finished = await uploads.complete(owner.id, opened.uploadId, png)
    const asset = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: finished.assetId } })
    expect(asset.state).toBe('READY')
    expect(asset.checksum).toBe(finished.checksum)
    expect(asset.ownerUserId).toBe(owner.id)
    const derivative = await prisma.mediaDerivative.findFirstOrThrow({ where: { assetId: asset.id } })
    expect(derivative.profile).toBe('full')
    expect(derivative.width).toBe(1)
    expect(derivative.height).toBe(1)
    expect(derivative.storageKey).toContain(asset.id)
    await expect(uploads.complete(owner.id, opened.uploadId, Buffer.from('<html></html>'))).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect((await prisma.mediaAsset.findUniqueOrThrow({ where: { id: finished.assetId } })).checksum).toBe(
      finished.checksum,
    )
    await expect(uploads.assertAttachable(other.id, finished.assetId, project.id)).rejects.toBeInstanceOf(
      NotFoundException,
    )
    await uploads.assertAttachable(owner.id, finished.assetId, project.id)

    await prisma.mediaAsset.create({
      data: {
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'gallery',
        checksum: 'quota',
        byteSize: 262_144_000n,
        state: 'READY',
      },
    })
    await expect(
      uploads.open({
        ownerUserId: owner.id,
        projectId: project.id,
        purpose: 'gallery',
        expectedBytes: 1,
        declaredMime: 'image/png',
        idempotencyKey: 'upload-quota',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
