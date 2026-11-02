import { createHash } from 'node:crypto'
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const COMMAND = 'request-message'

@Injectable()
export class RequestMessagesService {
  async add(input: {
    requestId: string
    authorUserId: string
    plainText: string
    asStaff: boolean
    visibility: 'CUSTOMER' | 'INTERNAL'
  }): Promise<void> {
    const visibility = input.asStaff ? input.visibility : 'CUSTOMER'
    await getPrismaClient().requestMessage.create({
      data: {
        requestId: input.requestId,
        authorUserId: input.authorUserId,
        plainText: input.plainText,
        visibility,
      },
    })
  }

  async listForCustomer(ownerUserId: string, requestId: string): Promise<{ plainText: string }[]> {
    const request = await getPrismaClient().serviceRequest.findFirst({
      where: { id: requestId, ownerUserId },
    })
    if (!request) throw new NotFoundException()
    return getPrismaClient().requestMessage.findMany({
      where: { requestId, visibility: 'CUSTOMER' },
      select: { plainText: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  async reply(input: {
    actorUserId: string
    requestId: string
    plainText: string
    visibility: 'CUSTOMER' | 'INTERNAL'
    idempotencyKey: string
  }): Promise<void> {
    const plainText = input.plainText.trim()
    const key = input.idempotencyKey.trim()
    if (!plainText || plainText.length > 2000 || !key || key.length > 80) {
      throw new UnprocessableEntityException('A message is required')
    }
    const requestHash = createHash('sha256').update(`${input.visibility}\n${plainText}`).digest('hex')
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: { principalId: input.actorUserId, command: COMMAND, key },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) return
      const actor = await tx.user.findUnique({ where: { id: input.actorUserId } })
      const request = await tx.serviceRequest.findUnique({
        where: { id: input.requestId },
        include: { project: { include: { assignments: true } } },
      })
      if (!actor || actor.status !== 'ACTIVE' || !request) throw new NotFoundException()
      const assigned = request.project.assignments.some(
        (row) => row.staffUserId === actor.id && row.revokedAt === null,
      )
      const staff = actor.role === 'ADMIN' || (actor.role === 'STUDIO' && assigned)
      const owner = request.ownerUserId === actor.id
      if (!staff && !owner) throw new NotFoundException()
      const visibility = staff ? input.visibility : 'CUSTOMER'
      const message = await tx.requestMessage.create({
        data: { requestId: request.id, authorUserId: actor.id, plainText, visibility },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: actor.id,
          command: COMMAND,
          key,
          requestHash,
          resourceId: message.id,
        },
      })
    })
  }
}
