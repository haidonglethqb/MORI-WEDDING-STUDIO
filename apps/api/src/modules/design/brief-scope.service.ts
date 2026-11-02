import { createHash } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const COMMAND = 'change-brief-scope'

@Injectable()
export class BriefScopeService {
  async change(input: {
    actorUserId: string
    requestId: string
    scopeFingerprint: string
    expectedVersion: number
    idempotencyKey: string
  }): Promise<void> {
    const scopeFingerprint = input.scopeFingerprint.trim()
    if (!scopeFingerprint || scopeFingerprint.length > 200) {
      throw new UnprocessableEntityException('A brief scope is required')
    }
    const requestHash = createHash('sha256')
      .update(JSON.stringify([input.requestId, input.expectedVersion, scopeFingerprint]))
      .digest('hex')
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${input.requestId}::uuid FOR UPDATE`
      const request = await tx.serviceRequest.findUnique({
        where: { id: input.requestId },
        include: { project: { include: { assignments: true } } },
      })
      const allowed =
        request !== null &&
        (request.ownerUserId === input.actorUserId ||
          request.project.assignments.some((row) => row.staffUserId === input.actorUserId && row.revokedAt === null))
      if (!request || !allowed) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key: input.idempotencyKey },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) return
      if (request.version !== input.expectedVersion) {
        throw new ConflictException({ code: 'VERSION_CONFLICT', message: 'This request has changed' })
      }
      await tx.designRevision.updateMany({
        where: { requestId: request.id, state: 'APPROVED' },
        data: { state: 'SUPERSEDED' },
      })
      await tx.serviceRequest.update({
        where: { id: request.id },
        data: { scopeFingerprint, version: { increment: 1 } },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.actorUserId,
          command: COMMAND,
          key: input.idempotencyKey,
          requestHash,
          resourceId: request.id,
        },
      })
    })
  }
}
