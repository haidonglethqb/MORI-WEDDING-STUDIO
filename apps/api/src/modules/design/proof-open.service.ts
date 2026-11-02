import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { ProofService } from './proof.service.js'

const COMMAND = 'open-proof-revision'

export interface CustomerProofItem {
  revisionId: string
  sequence: number
  state: string
  manifestHash: string
}

@Injectable()
export class ProofOpenService {
  constructor(private readonly proofs: ProofService) {}

  async open(input: {
    actorUserId: string
    requestId: string
    manifestHash: string
    idempotencyKey: string
  }): Promise<{ revisionId: string; sequence: number }> {
    const manifestHash = input.manifestHash.trim()
    const key = input.idempotencyKey.trim()
    if (!manifestHash || manifestHash.length > 200 || !key || key.length > 80) {
      throw new UnprocessableEntityException('A proof hash is required')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key } },
      })
      if (replay) {
        const existing = await tx.designRevision.findUnique({ where: { id: replay.resourceId } })
        if (!existing) throw new NotFoundException()
        return { revisionId: existing.id, sequence: existing.sequence }
      }
      if (!(await this.canEdit(input.actorUserId, input.requestId))) throw new NotFoundException()
      const latest = await tx.designRevision.findFirst({
        where: { requestId: input.requestId },
        orderBy: { sequence: 'desc' },
      })
      const revision = await tx.designRevision.create({
        data: {
          requestId: input.requestId,
          sequence: (latest?.sequence ?? 0) + 1,
          manifestHash,
          isFixture: true,
        },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.actorUserId,
          command: COMMAND,
          key,
          requestHash: manifestHash,
          resourceId: revision.id,
        },
      })
      return { revisionId: revision.id, sequence: revision.sequence }
    })
  }

  async prepare(
    actorUserId: string,
    revisionId: string,
    input: {
      renderState: 'READY' | 'FAILED'
      faceMapComplete: boolean
      fontsReady: boolean
      trimWidthMm: number
      trimHeightMm: number
      profileWidthMm: number
      profileHeightMm: number
    },
  ): Promise<void> {
    const prisma = getPrismaClient()
    const revision = await prisma.designRevision.findUnique({ where: { id: revisionId } })
    if (!revision || revision.state !== 'WORKING') throw new NotFoundException()
    if (!(await this.canEdit(actorUserId, revision.requestId))) throw new NotFoundException()
    await prisma.designRevision.update({
      where: { id: revisionId },
      data: input,
    })
  }

  async submit(actorUserId: string, requestId: string, revisionId: string): Promise<void> {
    if (!(await this.canEdit(actorUserId, requestId))) throw new NotFoundException()
    await this.proofs.submitForReview(requestId, revisionId)
  }

  async listForCustomer(ownerUserId: string, requestId: string): Promise<CustomerProofItem[]> {
    const request = await getPrismaClient().serviceRequest.findFirst({
      where: { id: requestId, ownerUserId },
      include: {
        revisions: {
          orderBy: { sequence: 'asc' },
          select: { id: true, sequence: true, state: true, manifestHash: true },
        },
      },
    })
    if (!request) throw new NotFoundException()
    return request.revisions.map((row) => ({
      revisionId: row.id,
      sequence: row.sequence,
      state: row.state,
      manifestHash: row.manifestHash,
    }))
  }

  async listForStaff(actorUserId: string, requestId: string): Promise<CustomerProofItem[]> {
    if (!(await this.canEdit(actorUserId, requestId))) throw new NotFoundException()
    const revisions = await getPrismaClient().designRevision.findMany({
      where: { requestId },
      orderBy: { sequence: 'asc' },
      select: { id: true, sequence: true, state: true, manifestHash: true },
    })
    return revisions.map((row) => ({
      revisionId: row.id,
      sequence: row.sequence,
      state: row.state,
      manifestHash: row.manifestHash,
    }))
  }

  private async canEdit(actorUserId: string, requestId: string): Promise<boolean> {
    const db = getPrismaClient()
    const actor = await db.user.findUnique({ where: { id: actorUserId } })
    const request = await db.serviceRequest.findUnique({
      where: { id: requestId },
      include: { project: { include: { assignments: true } } },
    })
    if (!actor || actor.status !== 'ACTIVE' || !request) return false
    if (actor.role === 'ADMIN') return true
    if (actor.role !== 'STUDIO') return false
    return request.project.assignments.some((row) => row.staffUserId === actor.id && row.revokedAt === null)
  }
}
