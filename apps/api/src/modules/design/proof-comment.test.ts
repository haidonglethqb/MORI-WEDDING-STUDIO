import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProofChangeService } from './proof-change.service.js'
import { ProofCommentService } from './proof-comment.service.js'
import { ProofService } from './proof.service.js'

const ownerEmail = `comment-owner-${Date.now()}@example.com`
const otherEmail = `comment-other-${Date.now()}@example.com`

describe('anchored proof comments', () => {
  const comments = new ProofCommentService()
  const changes = new ProofChangeService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps a page comment on its revision after a newer proof exists', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Comments' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const first = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 1, state: 'IN_REVIEW', manifestHash: 'hash-1', isFixture: true },
    })
    const second = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 2, manifestHash: 'hash-2', renderState: 'READY', faceMapComplete: true, isFixture: true },
    })

    const anchored = await comments.add({
      actorUserId: owner.id,
      revisionId: first.id,
      pageId: 'front',
      positionX: 250_000,
      positionY: 400_000,
      text: 'Tên cần lớn hơn',
      idempotencyKey: 'front-note',
    })
    const replay = await comments.add({
      actorUserId: owner.id,
      revisionId: first.id,
      pageId: 'front',
      positionX: 250_000,
      positionY: 400_000,
      text: 'Tên cần lớn hơn',
      idempotencyKey: 'front-note',
    })
    expect(replay.annotationId).toBe(anchored.annotationId)
    await expect(
      comments.add({
        actorUserId: other.id,
        revisionId: first.id,
        pageId: 'front',
        positionX: 0,
        positionY: 0,
        text: 'Không được',
        idempotencyKey: 'other-note',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)

    await new ProofService().submitForReview(request.id, second.id)
    await comments.add({
      actorUserId: owner.id,
      revisionId: second.id,
      pageId: 'back',
      positionX: 100_000,
      positionY: 100_000,
      text: 'Mặt sau',
      idempotencyKey: 'back-note',
    })

    const firstPage = await comments.list(owner.id, first.id)
    expect(firstPage).toEqual([
      {
        annotationId: anchored.annotationId,
        pageId: 'front',
        positionX: 250_000,
        positionY: 400_000,
        text: 'Tên cần lớn hơn',
      },
    ])
    expect((await comments.list(owner.id, second.id)).map((row) => row.pageId)).toEqual(['back'])

    await expect(
      changes.requestChanges({
        actorUserId: owner.id,
        revisionId: first.id,
        expectedVersion: 0,
        idempotencyKey: 'change-old',
        reason: 'Sửa bản cũ',
      }),
    ).rejects.toMatchObject({ response: { code: 'PROOF_SUPERSEDED' } })
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: second.id } })).state).toBe('IN_REVIEW')

    await changes.requestChanges({
      actorUserId: owner.id,
      revisionId: second.id,
      expectedVersion: 0,
      idempotencyKey: 'change-current',
      reason: 'Chỉnh mặt sau',
    })
    await changes.requestChanges({
      actorUserId: owner.id,
      revisionId: second.id,
      expectedVersion: 0,
      idempotencyKey: 'change-current',
      reason: 'Chỉnh mặt sau',
    })
    const updated = await prisma.serviceRequest.findUniqueOrThrow({ where: { id: request.id } })
    expect(updated.version).toBe(1)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: second.id } })).state).toBe(
      'CHANGES_REQUESTED',
    )
    const secondPage = await comments.list(owner.id, second.id)
    expect(secondPage.map((row) => row.pageId)).toEqual(['back', 'change-request'])
    expect(secondPage[1]?.text).toBe('Chỉnh mặt sau')
    expect(await prisma.proofAnnotation.count({ where: { revisionId: first.id } })).toBe(1)
  })
})