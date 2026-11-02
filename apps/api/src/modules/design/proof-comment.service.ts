import { createHash } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const COMMAND = 'proof-comment'

export interface AnchoredComment {
  annotationId: string
  pageId: string
  positionX: number
  positionY: number
  text: string
}

@Injectable()
export class ProofCommentService {
  async add(input: {
    actorUserId: string
    revisionId: string
    pageId: string
    positionX: number
    positionY: number
    text: string
    idempotencyKey: string
  }): Promise<{ annotationId: string }> {
    const pageId = input.pageId.trim()
    const text = input.text.trim()
    if (!pageId || pageId.length > 80 || !text || text.length > 2000) {
      throw new UnprocessableEntityException('This comment is not valid')
    }
    if (!onPage(input.positionX) || !onPage(input.positionY)) {
      throw new UnprocessableEntityException('This comment is not valid')
    }
    const requestHash = createHash('sha256')
      .update(JSON.stringify([input.revisionId, pageId, input.positionX, input.positionY, text]))
      .digest('hex')
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const revision = await tx.designRevision.findUnique({
        where: { id: input.revisionId },
        include: { request: { include: { project: { include: { assignments: true } } } } },
      })
      if (!revision || !canSee(input.actorUserId, revision.request)) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${revision.requestId}::uuid FOR UPDATE`
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key: input.idempotencyKey },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) return { annotationId: replay.resourceId }
      const created = await tx.proofAnnotation.create({
        data: {
          revisionId: revision.id,
          authorUserId: input.actorUserId,
          pageId,
          positionX: input.positionX,
          positionY: input.positionY,
          text,
        },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.actorUserId,
          command: COMMAND,
          key: input.idempotencyKey,
          requestHash,
          resourceId: created.id,
        },
      })
      return { annotationId: created.id }
    })
  }

  async list(actorUserId: string, revisionId: string): Promise<AnchoredComment[]> {
    const revision = await getPrismaClient().designRevision.findFirst({
      where: { id: revisionId },
      include: {
        request: { include: { project: { include: { assignments: true } } } },
        annotations: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!revision || !canSee(actorUserId, revision.request)) throw new NotFoundException()
    return revision.annotations.map((row) => ({
      annotationId: row.id,
      pageId: row.pageId,
      positionX: row.positionX,
      positionY: row.positionY,
      text: row.text,
    }))
  }
}

function onPage(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 1_000_000
}

function canSee(
  actorUserId: string,
  request: {
    ownerUserId: string
    project: { assignments: { staffUserId: string; revokedAt: Date | null }[] }
  },
): boolean {
  if (request.ownerUserId === actorUserId) return true
  return request.project.assignments.some((row) => row.staffUserId === actorUserId && row.revokedAt === null)
}
