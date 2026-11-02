import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { formatVnd } from '@mori/domain'
import { recordNotice } from '../notifications/notification.service.js'

@Injectable()
export class OrderConfirmService {
  async confirm(staffUserId: string, orderId: string): Promise<{ status: 'CONFIRMED'; totalAmountVnd: string }> {
    const prisma = getPrismaClient()
    const staff = await prisma.user.findFirst({
      where: { id: staffUserId, role: { in: ['STUDIO', 'ADMIN'] }, status: 'ACTIVE' },
    })
    if (!staff) throw new NotFoundException()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId}::uuid FOR UPDATE`
      const order = await tx.order.findUnique({ where: { id: orderId } })
      if (!order) throw new NotFoundException()
      if (order.status !== 'SUBMITTED') {
        throw new ConflictException('This order can no longer be confirmed')
      }
      await tx.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } })
      await recordNotice(tx, {
        recipientUserId: order.ownerUserId,
        eventType: 'ORDER_CONFIRMED',
        resourceRef: order.id,
        plainText: 'Xưởng đã xác nhận đơn.',
      })
      return { status: 'CONFIRMED', totalAmountVnd: formatVnd(order.totalAmountVnd) }
    })
  }
}
