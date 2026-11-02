import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProofService } from './proof.service.js'

const email = `proof-${Date.now()}@example.com`

describe('ProofService', () => {
  const proofs = new ProofService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps the approved file when a newer draft exists', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Fixture proof' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const first = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 1, manifestHash: 'hash-1', renderState: 'READY', faceMapComplete: true, isFixture: true },
    })
    await proofs.submitForReview(request.id, first.id)
    await expect(proofs.replaceWorkingFile(first.id, 'hash-1-changed')).rejects.toBeInstanceOf(
      ConflictException,
    )

    const second = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 2, manifestHash: 'hash-2', renderState: 'READY', faceMapComplete: true, isFixture: true },
    })
    await proofs.submitForReview(request.id, second.id)
    const acknowledgement = {
      names: true,
      dates: true,
      venues: true,
      quantitySpec: true,
      screenColour: true,
      version: true,
    }
    await expect(
      proofs.approve({
        actorUserId: owner.id,
        revisionId: first.id,
        manifestHash: 'hash-1',
        scopeFingerprint: 'scope-1',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement,
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    await expect(
      proofs.approve({
        actorUserId: owner.id,
        revisionId: second.id,
        manifestHash: 'hash-wrong',
        scopeFingerprint: 'scope-2',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement,
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    await proofs.approve({
      actorUserId: owner.id,
      revisionId: second.id,
      manifestHash: 'hash-2',
      scopeFingerprint: 'scope-2',
      acknowledgementVersion: 'fixture-ack-1',
      acknowledgement,
    })

    await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 3, manifestHash: 'hash-3', isFixture: true },
    })
    expect(await proofs.acceptedManifest(request.id)).toBe('hash-2')
  })
})