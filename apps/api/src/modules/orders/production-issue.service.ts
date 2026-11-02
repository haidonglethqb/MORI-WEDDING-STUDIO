import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { recordNotice } from '../notifications/notification.service.js'

@Injectable()
export class ProductionIssueService {
  async failQuality(staffUserId: string, orderId: string, reason: string): Promise<void> {
    const trimmed = this.reason(reason)
    const prisma = getPrismaClient()
    await this.requireStaff(staffUserId)
    await prisma.$transaction(async (tx) => {
      const track = await tx.physicalFulfillment.findUnique({ where: { orderId } })
      if (!track) throw new NotFoundException()
      if (track.stage !== 'QUALITY_CHECK') {
        throw new ConflictException('Quality failure only applies during quality check')
      }
      await tx.physicalFulfillment.update({
        where: { orderId },
        data: { stage: 'IN_PRODUCTION' },
      })
      await tx.productionIssue.create({
        data: { orderId, staffUserId, reason: trimmed },
      })
    })
  }

  async hold(staffUserId: string, orderId: string, reason: string): Promise<void> {
    const trimmed = this.reason(reason)
    const prisma = getPrismaClient()
    await this.requireStaff(staffUserId)
    const track = await prisma.physicalFulfillment.findUnique({ where: { orderId } })
    if (!track) throw new NotFoundException()
    const stage = track.stage
    await prisma.physicalFulfillment.update({
      where: { orderId },
      data: { onHold: true, holdReason: trimmed, heldByUserId: staffUserId, stage },
    })
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (order) {
      await recordNotice(prisma, {
        recipientUserId: order.ownerUserId,
        eventType: 'ORDER_ON_HOLD',
        resourceRef: orderId,
        plainText: 'Đơn giấy đang tạm dừng.',
      })
    }
  }

  private reason(reason: string): string {
    const trimmed = reason.trim()
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new ConflictException('A production note needs a reason')
    }
    return trimmed
  }

  private async requireStaff(staffUserId: string): Promise<void> {
    const staff = await getPrismaClient().user.findFirst({
      where: { id: staffUserId, role: { in: ['STUDIO', 'ADMIN'] }, status: 'ACTIVE' },
    })
    if (!staff) throw new NotFoundException()
  }
}
