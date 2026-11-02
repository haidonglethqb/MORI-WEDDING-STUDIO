import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { productionBlockReason } from '@mori/domain'

const PHYSICAL_NEXT = {
  PENDING: 'IN_PRODUCTION',
  IN_PRODUCTION: 'QUALITY_CHECK',
  QUALITY_CHECK: 'READY_TO_SHIP',
  READY_TO_SHIP: 'SHIPPED',
  SHIPPED: 'DELIVERED',
} as const

const DIGITAL_NEXT = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'READY_FOR_HANDOVER',
  READY_FOR_HANDOVER: 'HANDED_OVER',
} as const

@Injectable()
export class FulfillmentService {
  async advancePhysical(orderId: string, stage: (typeof PHYSICAL_NEXT)[keyof typeof PHYSICAL_NEXT]) {
    const prisma = getPrismaClient()
    const track = await prisma.physicalFulfillment.findUnique({ where: { orderId } })
    if (!track) throw new NotFoundException()
    await this.assertOpen(orderId)
    const expected = PHYSICAL_NEXT[track.stage as keyof typeof PHYSICAL_NEXT]
    if (expected !== stage) throw new ConflictException('That fulfillment step is not next')
    if (stage === 'IN_PRODUCTION') {
      await this.assertReady(orderId)
      const reason = await this.preflight(orderId)
      if (reason) throw new ConflictException(reason)
    }
    await prisma.physicalFulfillment.update({ where: { orderId }, data: { stage } })
    return this.refresh(orderId)
  }

  async advanceDigital(orderId: string, stage: (typeof DIGITAL_NEXT)[keyof typeof DIGITAL_NEXT]) {
    const prisma = getPrismaClient()
    const track = await prisma.digitalFulfillment.findUnique({ where: { orderId } })
    if (!track) throw new NotFoundException()
    await this.assertOpen(orderId)
    const expected = DIGITAL_NEXT[track.stage as keyof typeof DIGITAL_NEXT]
    if (expected !== stage) throw new ConflictException('That fulfillment step is not next')
    if (stage === 'IN_PROGRESS') await this.assertReady(orderId)
    await prisma.digitalFulfillment.update({ where: { orderId }, data: { stage } })
    return this.refresh(orderId)
  }

  private async assertOpen(orderId: string): Promise<void> {
    const order = await getPrismaClient().order.findUnique({ where: { id: orderId } })
    if (order?.status === 'COMPLETED' || order?.status === 'CANCELLED') {
      throw new ConflictException('This order can no longer change')
    }
  }

  private async assertReady(orderId: string): Promise<void> {
    const order = await getPrismaClient().order.findUnique({ where: { id: orderId } })
    if (!order || (order.status !== 'CONFIRMED' && order.status !== 'IN_FULFILLMENT')) {
      throw new ConflictException('Confirm the order before production')
    }
  }

  private async preflight(orderId: string): Promise<string | null> {
    const track = await getPrismaClient().physicalFulfillment.findUnique({
      where: { orderId },
      include: { proofRevision: { include: { approval: true } } },
    })
    const revision = track?.proofRevision
    return productionBlockReason({
      approvedHash: revision?.approval?.manifestHash ?? null,
      fileHash: revision?.manifestHash ?? null,
      trimWidthMm: revision?.trimWidthMm ?? null,
      trimHeightMm: revision?.trimHeightMm ?? null,
      profileWidthMm: revision?.profileWidthMm ?? null,
      profileHeightMm: revision?.profileHeightMm ?? null,
      fontsReady: revision?.fontsReady ?? false,
    })
  }

  private async refresh(orderId: string): Promise<{ status: string }> {
    const prisma = getPrismaClient()
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { physical: true, digital: true },
    })
    if (!order) throw new NotFoundException()
    const stages = [order.physical?.stage, order.digital?.stage].filter((stage) => stage !== undefined)
    const done = stages.every((stage) => stage === 'DELIVERED' || stage === 'HANDED_OVER')
    const started = stages.some((stage) => stage !== 'PENDING')
    const status = done ? 'COMPLETED' : started ? 'IN_FULFILLMENT' : order.status
    await prisma.order.update({ where: { id: orderId }, data: { status } })
    return { status }
  }
}
