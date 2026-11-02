import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { acceptedProofId } from '../orders/accepted-proof.js'
import { ProofService } from './proof.service.js'

const email = `superseded-${Date.now()}@example.com`
const acknowledgement = {
  names: true,
  dates: true,
  venues: true,
  quantitySpec: true,
  screenColour: true,
  version: true,
}

describe('superseded proofs', () => {
  const proofs = new ProofService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps one current revision when approval and a new proof race', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Superseded' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const first = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'IN_REVIEW',
        manifestHash: 'hash-old',
        renderState: 'READY',
        faceMapComplete: true,
        isFixture: true,
      },
    })
    const second = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 2,
        manifestHash: 'hash-new',
        renderState: 'READY',
        faceMapComplete: true,
        isFixture: true,
      },
    })

    await Promise.allSettled([
      proofs.approve({
        actorUserId: owner.id,
        revisionId: first.id,
        manifestHash: 'hash-old',
        scopeFingerprint: 'scope-old',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement,
      }),
      proofs.submitForReview(request.id, second.id),
    ])

    const rows = await prisma.designRevision.findMany({
      where: { requestId: request.id },
      orderBy: { sequence: 'asc' },
    })
    expect(rows.map((row) => row.state)).toEqual(['SUPERSEDED', 'IN_REVIEW'])
    expect(rows.filter((row) => row.state === 'APPROVED')).toHaveLength(0)
    const approvals = await prisma.proofApproval.count({ where: { revisionId: first.id } })
    expect(approvals).toBeLessThanOrEqual(1)
    await expect(
      prisma.$transaction((tx) => acceptedProofId(tx, request.id)),
    ).rejects.toBeInstanceOf(ConflictException)

    await expect(
      proofs.approve({
        actorUserId: owner.id,
        revisionId: first.id,
        manifestHash: 'hash-old',
        scopeFingerprint: 'scope-old',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement,
      }),
    ).rejects.toMatchObject({ response: { code: 'PROOF_SUPERSEDED' } })
    expect(await prisma.proofApproval.count({ where: { revisionId: first.id } })).toBe(approvals)
  })
})