import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { formatVnd } from '@mori/domain'

export interface OrderView {
  orderId: string
  status: string
  currency: 'VND'
  totalAmountVnd: string
  physicalStage: string | null
  digitalStage: string | null
}

export interface OrderDetail extends OrderView {
  isFixture: boolean
  acceptedAt: string
  shippingAmountVnd: string | null
  taxAmountVnd: string | null
  physicalOnHold: boolean
  holdReason: string | null
  shipRecipientName: string | null
  shipLocality: string | null
  shipProvince: string | null
  shipmentExceptions: { reason: string; createdAt: string }[]
  cancellations: { state: string; reason: string }[]
}

@Injectable()
export class OrderReadService {
  async read(actorUserId: string, orderId: string): Promise<OrderView> {
    const order = await this.find(actorUserId, orderId)
    if (!order) throw new NotFoundException()
    return toOrderView(order)
  }

  async detail(actorUserId: string, orderId: string): Promise<OrderDetail> {
    const order = await this.find(actorUserId, orderId)
    if (!order) throw new NotFoundException()
    return {
      ...toOrderView(order),
      isFixture: order.isFixture,
      acceptedAt: order.acceptedAt.toISOString(),
      shippingAmountVnd: order.quote.shippingAmountVnd === null ? null : formatVnd(order.quote.shippingAmountVnd),
      taxAmountVnd: order.quote.taxAmountVnd === null ? null : formatVnd(order.quote.taxAmountVnd),
      physicalOnHold: order.physical?.onHold ?? false,
      holdReason: order.physical?.holdReason ?? null,
      shipRecipientName: order.shipRecipientName,
      shipLocality: order.shipLocality,
      shipProvince: order.shipProvince,
      shipmentExceptions: (order.shipment?.events ?? []).map((event) => ({
        reason: event.reason,
        createdAt: event.createdAt.toISOString(),
      })),
      cancellations: order.cancellations.map((row) => ({ state: row.state, reason: row.reason })),
    }
  }

  private async find(actorUserId: string, orderId: string) {
    const prisma = getPrismaClient()
    const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
    if (!actor || actor.status !== 'ACTIVE') return null
    return prisma.order.findFirst({
      where: {
        id: orderId,
        ...(actor.role === 'ADMIN'
          ? {}
          : {
              OR: [
                { ownerUserId: actorUserId },
                {
                  request: {
                    project: { assignments: { some: { staffUserId: actorUserId, revokedAt: null } } },
                  },
                },
              ],
            }),
      },
      include: {
        physical: true,
        digital: true,
        quote: true,
        shipment: { include: { events: { orderBy: { createdAt: 'asc' } } } },
        cancellations: { orderBy: { createdAt: 'asc' } },
      },
    })
  }

  async listForOwner(ownerUserId: string): Promise<OrderView[]> {
    const orders = await getPrismaClient().order.findMany({
      where: { ownerUserId },
      include: { physical: true, digital: true },
      orderBy: { acceptedAt: 'desc' },
    })
    return orders.map(toOrderView)
  }
}

function toOrderView(order: {
  id: string
  status: string
  totalAmountVnd: bigint
  physical: { stage: string } | null
  digital: { stage: string } | null
}): OrderView {
  return {
    orderId: order.id,
    status: order.status,
    currency: 'VND',
    totalAmountVnd: formatVnd(order.totalAmountVnd),
    physicalStage: order.physical?.stage ?? null,
    digitalStage: order.digital?.stage ?? null,
  }
}
