import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { recordNotice } from '../notifications/notification.service.js'

const STARTED = new Set(['IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'IN_PROGRESS', 'READY_FOR_HANDOVER', 'HANDED_OVER'])

@Injectable()
export class CancellationRequestService {
  async request(ownerUserId: string, orderId: string, reason: string): Promise<{ id: string }> {
    const trimmed = reason.trim()
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new ConflictException('A cancellation request needs a reason')
    }
    const prisma = getPrismaClient()
    const order = await prisma.order.findFirst({ where: { id: orderId, ownerUserId } })
    if (!order) throw new NotFoundException()
    const created = await prisma.cancellationRequest.create({
      data: { orderId, ownerUserId, reason: trimmed },
    })
    return { id: created.id }
  }

  async decide(staffUserId: string, requestId: string, approve: boolean, decisionReason: string): Promise<void> {
    const trimmed = decisionReason.trim()
    if (trimmed.length < 1) throw new ConflictException('A cancellation decision needs a reason')
    const prisma = getPrismaClient()
    const staff = await prisma.user.findFirst({
      where: { id: staffUserId, role: { in: ['STUDIO', 'ADMIN'] }, status: 'ACTIVE' },
    })
    if (!staff) throw new NotFoundException()
    await prisma.$transaction(async (tx) => {
      const request = await tx.cancellationRequest.findUnique({
        where: { id: requestId },
        include: { order: { include: { physical: true, digital: true } } },
      })
      if (!request || request.state !== 'REQUESTED') throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${request.orderId}::uuid FOR UPDATE`
      const stages = [request.order.physical?.stage, request.order.digital?.stage]
      const started = stages.some((stage) => stage !== undefined && STARTED.has(stage))
      if (!approve) {
        await tx.cancellationRequest.update({
          where: { id: request.id },
          data: { state: 'DENIED', outcome: 'DENIED', decisionReason: trimmed, decidedAt: new Date() },
        })
        await recordNotice(tx, {
          recipientUserId: request.order.ownerUserId,
          eventType: 'CANCELLATION_DENIED',
          resourceRef: request.orderId,
          plainText: 'Xưởng giữ đơn.',
        })
        return
      }
      if (!started) {
        await tx.order.update({ where: { id: request.orderId }, data: { status: 'CANCELLED' } })
        await tx.cancellationRequest.update({
          where: { id: request.id },
          data: {
            state: 'APPROVED',
            outcome: 'CANCELLED_BEFORE_WORK',
            decisionReason: trimmed,
            decidedAt: new Date(),
          },
        })
        await recordNotice(tx, {
          recipientUserId: request.order.ownerUserId,
          eventType: 'CANCELLATION_APPROVED',
          resourceRef: request.orderId,
          plainText: 'Đơn được hủy trước khi làm.',
        })
        return
      }
      await tx.cancellationRequest.update({
        where: { id: request.id },
        data: {
          state: 'APPROVED',
          outcome: 'EXCEPTION_AFTER_WORK',
          decisionReason: trimmed,
          decidedAt: new Date(),
        },
      })
      await recordNotice(tx, {
        recipientUserId: request.order.ownerUserId,
        eventType: 'CANCELLATION_APPROVED',
        resourceRef: request.orderId,
        plainText: 'Yêu cầu hủy được ghi sau khi đã làm.',
      })
    })
  }
}
