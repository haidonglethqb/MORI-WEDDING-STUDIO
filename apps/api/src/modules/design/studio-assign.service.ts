import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const COMMAND = 'assign-studio-request'

@Injectable()
export class StudioAssignService {
  async staff(): Promise<{ staffUserId: string; displayName: string }[]> {
    const rows = await getPrismaClient().user.findMany({
      where: { role: 'STUDIO', status: 'ACTIVE' },
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true },
    })
    return rows.map((row) => ({ staffUserId: row.id, displayName: row.displayName }))
  }

  async assign(input: {
    actorUserId: string
    requestId: string
    staffUserId: string
    idempotencyKey: string
  }): Promise<{ assignmentId: string }> {
    const key = input.idempotencyKey.trim()
    if (!key || key.length > 80) throw new UnprocessableEntityException('An idempotency key is required')
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key } },
      })
      if (replay) return { assignmentId: replay.resourceId }
      const actor = await tx.user.findUnique({ where: { id: input.actorUserId } })
      if (!actor || actor.status !== 'ACTIVE' || actor.role !== 'ADMIN') throw new NotFoundException()
      const request = await tx.serviceRequest.findUnique({ where: { id: input.requestId } })
      const staff = await tx.user.findUnique({ where: { id: input.staffUserId } })
      if (!request || !staff || staff.status !== 'ACTIVE' || staff.role !== 'STUDIO') throw new NotFoundException()
      const existing = await tx.staffAssignment.findFirst({
        where: { projectId: request.projectId, staffUserId: staff.id, revokedAt: null },
      })
      if (existing) return { assignmentId: existing.id }
      const assignment = await tx.staffAssignment.create({
        data: { projectId: request.projectId, staffUserId: staff.id },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: actor.id,
          command: COMMAND,
          key,
          requestHash: `${request.id}:${staff.id}`,
          resourceId: assignment.id,
        },
      })
      return { assignmentId: assignment.id }
    })
  }
}
