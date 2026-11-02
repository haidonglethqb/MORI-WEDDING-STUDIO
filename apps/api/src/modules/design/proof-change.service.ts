import { createHash } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const COMMAND = 'request-proof-changes'

@Injectable()
export class ProofChangeService {
  async requestChanges(input: {
    actorUserId: string
    revisionId: string
    expectedVersion: number
    idempotencyKey: string
    reason: string
  }): Promise<{ revisionId: string; state: 'CHANGES_REQUESTED' }> {
    const reason = input.reason.trim()
    if (!reason || reason.length > 500) throw new UnprocessableEntityException('A change reason is required')
    const requestHash = createHash('sha256')
      .update(JSON.stringify([input.revisionId, input.expectedVersion, reason]))
      .digest('hex')
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const revision = await tx.designRevision.findUnique({
        where: { id: input.revisionId },
        include: { request: true },
      })
      if (!revision || revision.request.ownerUserId !== input.actorUserId) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${revision.requestId}::uuid FOR UPDATE`
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key: input.idempotencyKey },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) return { revisionId: input.revisionId, state: 'CHANGES_REQUESTED' }
      const current = await tx.designRevision.findUnique({ where: { id: input.revisionId } })
      const request = await tx.serviceRequest.findUnique({ where: { id: revision.requestId } })
      if (!current || !request) throw new NotFoundException()
      if (request.version !== input.expectedVersion) {
        throw new ConflictException({ code: 'VERSION_CONFLICT', message: 'This request has changed' })
      }
      if (current.state === 'SUPERSEDED') {
        throw new ConflictException({ code: 'PROOF_SUPERSEDED', message: 'This proof has been replaced' })
      }
      if (current.state !== 'IN_REVIEW') throw new ConflictException('This proof is not under review')
      await tx.proofAnnotation.create({
        data: {
          revisionId: current.id,
          authorUserId: input.actorUserId,
          pageId: 'change-request',
          positionX: 0,
          positionY: 0,
          text: reason,
        },
      })
      await tx.designRevision.update({ where: { id: current.id }, data: { state: 'CHANGES_REQUESTED' } })
      await tx.serviceRequest.update({ where: { id: request.id }, data: { version: { increment: 1 } } })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.actorUserId,
          command: COMMAND,
          key: input.idempotencyKey,
          requestHash,
          resourceId: current.id,
        },
      })
      return { revisionId: current.id, state: 'CHANGES_REQUESTED' }
    })
  }
}
