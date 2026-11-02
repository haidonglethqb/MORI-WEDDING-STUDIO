import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProofService } from './proof.service.js'

const email = `render-${Date.now()}@example.com`
const acknowledgement = {
  names: true,
  dates: true,
  venues: true,
  quantitySpec: true,
  screenColour: true,
  version: true,
}

describe('proof readiness', () => {
  const proofs = new ProofService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses review when rendering failed or the page map is incomplete', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Render' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const failed = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 1, manifestHash: 'hash-failed', renderState: 'FAILED', isFixture: true },
    })
    const unmapped = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 2,
        manifestHash: 'hash-map',
        renderState: 'READY',
        faceMapComplete: false,
        isFixture: true,
      },
    })
    const held = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 3,
        state: 'IN_REVIEW',
        manifestHash: 'hash-held',
        renderState: 'FAILED',
        isFixture: true,
      },
    })

    await expect(proofs.submitForReview(request.id, failed.id)).rejects.toMatchObject({
      response: { code: 'PROOF_NOT_READY' },
    })
    await expect(proofs.submitForReview(request.id, unmapped.id)).rejects.toMatchObject({
      response: { code: 'PROOF_NOT_READY' },
    })
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: failed.id } })).state).toBe('WORKING')
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: unmapped.id } })).state).toBe('WORKING')

    await expect(
      proofs.approve({
        actorUserId: owner.id,
        revisionId: held.id,
        manifestHash: 'hash-held',
        scopeFingerprint: 'scope-held',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement,
      }),
    ).rejects.toMatchObject({ response: { code: 'PROOF_NOT_READY' } })
    expect(await prisma.proofApproval.count({ where: { revisionId: held.id } })).toBe(0)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: held.id } })).state).toBe('IN_REVIEW')
  })
})