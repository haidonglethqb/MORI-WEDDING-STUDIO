import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface StudioQueueItem {
  requestId: string
  kind: string
  status: string
  internalTitle: string
}

export interface StudioRequestDetail extends StudioQueueItem {
  messages: { visibility: 'CUSTOMER' | 'INTERNAL'; plainText: string }[]
}

@Injectable()
export class StudioQueueService {
  async queue(actorUserId: string): Promise<StudioQueueItem[]> {
    const prisma = getPrismaClient()
    const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
    if (!actor || actor.status !== 'ACTIVE' || (actor.role !== 'STUDIO' && actor.role !== 'ADMIN')) {
      throw new NotFoundException()
    }
    const rows = await prisma.serviceRequest.findMany({
      where:
        actor.role === 'ADMIN'
          ? {}
          : { project: { assignments: { some: { staffUserId: actorUserId, revokedAt: null } } } },
      include: { project: true },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => ({
      requestId: row.id,
      kind: row.kind,
      status: row.status,
      internalTitle: row.project.internalTitle,
    }))
  }

  async read(actorUserId: string, requestId: string): Promise<StudioRequestDetail> {
    const prisma = getPrismaClient()
    const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
    if (!actor || actor.status !== 'ACTIVE' || (actor.role !== 'STUDIO' && actor.role !== 'ADMIN')) {
      throw new NotFoundException()
    }
    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        ...(actor.role === 'ADMIN'
          ? {}
          : { project: { assignments: { some: { staffUserId: actorUserId, revokedAt: null } } } }),
      },
      include: {
        project: true,
        messages: { orderBy: { createdAt: 'asc' }, select: { visibility: true, plainText: true } },
      },
    })
    if (!request) throw new NotFoundException()
    return {
      requestId: request.id,
      kind: request.kind,
      status: request.status,
      internalTitle: request.project.internalTitle,
      messages: request.messages,
    }
  }
}
