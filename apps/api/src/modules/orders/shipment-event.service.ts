import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class ShipmentEventService {
  async recordException(staffUserId: string, orderId: string, reason: string): Promise<void> {
    const trimmed = reason.trim()
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new ConflictException('A shipment exception needs a reason')
    }
    const prisma = getPrismaClient()
    const staff = await prisma.user.findFirst({
      where: { id: staffUserId, role: { in: ['STUDIO', 'ADMIN'] }, status: 'ACTIVE' },
    })
    if (!staff) throw new NotFoundException()
    await prisma.$transaction(async (tx) => {
      const track = await tx.physicalFulfillment.findUnique({ where: { orderId } })
      if (!track || track.stage !== 'SHIPPED') throw new NotFoundException()
      const shipment = await tx.shipment.upsert({
        where: { orderId },
        create: { orderId },
        update: {},
      })
      await tx.shipmentEvent.create({
        data: { shipmentId: shipment.id, staffUserId, kind: 'EXCEPTION', reason: trimmed },
      })
    })
  }
}
