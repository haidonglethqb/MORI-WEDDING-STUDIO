import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { assertProofAcknowledgement, type ProofAcknowledgement } from './proof-acknowledgement.js'
import { assertProofReady } from './proof-readiness.js'
import { recordNotice } from '../notifications/notification.service.js'

@Injectable()
export class ProofService {
  async submitForReview(requestId: string, revisionId: string): Promise<void> {
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${requestId}::uuid FOR UPDATE`
      const revision = await tx.designRevision.findFirst({ where: { id: revisionId, requestId } })
      if (!revision || revision.state !== 'WORKING') throw new ConflictException('This revision cannot be submitted')
      assertProofReady(revision)
      await tx.designRevision.updateMany({
        where: { requestId, state: { in: ['IN_REVIEW', 'APPROVED'] } },
        data: { state: 'SUPERSEDED' },
      })
      await tx.designRevision.update({ where: { id: revisionId }, data: { state: 'IN_REVIEW' } })
      const request = await tx.serviceRequest.findUnique({ where: { id: requestId } })
      if (request) {
        await recordNotice(tx, {
          recipientUserId: request.ownerUserId,
          eventType: 'PROOF_IN_REVIEW',
          resourceRef: requestId,
          plainText: 'Có bản in mới để xem.',
        })
      }
    })
  }

  async replaceWorkingFile(revisionId: string, manifestHash: string): Promise<void> {
    const updated = await getPrismaClient().designRevision.updateMany({
      where: { id: revisionId, state: 'WORKING' },
      data: { manifestHash },
    })
    if (updated.count !== 1) throw new ConflictException('A submitted revision cannot be overwritten')
  }

  async approve(input: {
    actorUserId: string
    revisionId: string
    manifestHash: string
    scopeFingerprint: string
    acknowledgementVersion: string
    acknowledgement: ProofAcknowledgement
  }): Promise<void> {
    assertProofAcknowledgement(input.acknowledgement)
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const revision = await tx.designRevision.findUnique({
        where: { id: input.revisionId },
        include: { request: true },
      })
      if (!revision || revision.request.ownerUserId !== input.actorUserId) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${revision.requestId}::uuid FOR UPDATE`
      const current = await tx.designRevision.findUnique({ where: { id: input.revisionId } })
      if (!current || current.manifestHash !== input.manifestHash) {
        throw new ConflictException('This proof is no longer the one under review')
      }
      if (current.state === 'SUPERSEDED') {
        throw new ConflictException({
          code: 'PROOF_SUPERSEDED',
          message: 'This proof has been replaced',
        })
      }
      if (current.state !== 'IN_REVIEW') {
        throw new ConflictException('This proof is no longer the one under review')
      }
      assertProofReady(current)
      await tx.proofApproval.create({
        data: {
          revisionId: input.revisionId,
          ownerUserId: input.actorUserId,
          manifestHash: input.manifestHash,
          scopeFingerprint: input.scopeFingerprint,
          acknowledgementVersion: input.acknowledgementVersion,
        },
      })
      await tx.designRevision.update({ where: { id: input.revisionId }, data: { state: 'APPROVED' } })
    })
  }

  async read(actorUserId: string, revisionId: string): Promise<{
    revisionId: string
    sequence: number
    state: string
    manifestHash: string
  }> {
    const revision = await getPrismaClient().designRevision.findFirst({
      where: {
        id: revisionId,
        request: {
          OR: [
            { ownerUserId: actorUserId },
            {
              project: {
                assignments: { some: { staffUserId: actorUserId, revokedAt: null } },
              },
            },
          ],
        },
      },
    })
    if (!revision) throw new NotFoundException()
    return {
      revisionId: revision.id,
      sequence: revision.sequence,
      state: revision.state,
      manifestHash: revision.manifestHash,
    }
  }

  async acceptedManifest(requestId: string): Promise<string> {
    const approval = await getPrismaClient().proofApproval.findFirst({
      where: { revision: { requestId, state: 'APPROVED' } },
      include: { revision: true },
    })
    if (!approval) throw new NotFoundException()
    return approval.revision.manifestHash
  }
}
