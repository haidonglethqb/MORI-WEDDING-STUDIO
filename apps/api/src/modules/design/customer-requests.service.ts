import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { RequestMessagesService } from './request-messages.service.js'

const CREATE_COMMAND = 'create-design-request'
const KINDS = new Set(['PAPER', 'DIGITAL', 'BUNDLE'])

export interface CustomerRequestItem {
  requestId: string
  kind: string
  status: string
}

@Injectable()
export class CustomerRequestsService {
  constructor(private readonly messages: RequestMessagesService) {}

  async list(ownerUserId: string): Promise<CustomerRequestItem[]> {
    const rows = await getPrismaClient().serviceRequest.findMany({
      where: { ownerUserId },
      orderBy: { id: 'asc' },
      select: { id: true, kind: true, status: true },
    })
    return rows.map((row) => ({ requestId: row.id, kind: row.kind, status: row.status }))
  }

  async start(ownerUserId: string, kind: string, idempotencyKey: string): Promise<CustomerRequestItem> {
    const key = idempotencyKey.trim()
    if (!KINDS.has(kind) || !key || key.length > 80) {
      throw new UnprocessableEntityException('A design request needs a supported kind')
    }
    const prisma = getPrismaClient()
    const requestId = await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: ownerUserId, command: CREATE_COMMAND, key } },
      })
      if (replay) return replay.resourceId
      const project = await tx.weddingProject.create({
        data: { ownerUserId, internalTitle: 'Yêu cầu của khách' },
      })
      const request = await tx.serviceRequest.create({
        data: { projectId: project.id, ownerUserId, kind: kind as 'PAPER' | 'DIGITAL' | 'BUNDLE', isFixture: true },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: ownerUserId,
          command: CREATE_COMMAND,
          key,
          requestHash: kind,
          resourceId: request.id,
        },
      })
      return request.id
    })
    const created = (await this.list(ownerUserId)).find((item) => item.requestId === requestId)
    if (!created) throw new UnprocessableEntityException('The request could not be opened')
    return created
  }

  async thread(ownerUserId: string, requestId: string): Promise<{ plainText: string }[]> {
    return this.messages.listForCustomer(ownerUserId, requestId)
  }

  async reply(ownerUserId: string, requestId: string, plainText: string, idempotencyKey: string): Promise<void> {
    const owned = await getPrismaClient().serviceRequest.findFirst({
      where: { id: requestId, ownerUserId },
      select: { id: true },
    })
    if (!owned) throw new NotFoundException()
    await this.messages.reply({
      actorUserId: ownerUserId,
      requestId,
      plainText,
      visibility: 'CUSTOMER',
      idempotencyKey,
    })
  }
}
