import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { ProductionIssueService } from './production-issue.service.js'
import { ShipmentEventService } from './shipment-event.service.js'

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

export interface StudioOrderItem {
  orderId: string
  status: string
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
  cancellations: { cancellationId: string; state: string; reason: string }[]
}

@Injectable()
export class StudioOrderService {
  constructor(
    private readonly fulfillment: FulfillmentService,
    private readonly cancellations: CancellationRequestService = new CancellationRequestService(),
    private readonly production: ProductionIssueService = new ProductionIssueService(),
    private readonly shipments: ShipmentEventService = new ShipmentEventService(),
  ) {}

  async list(actorUserId: string): Promise<StudioOrderItem[]> {
    const actor = await this.staff(actorUserId)
    const rows = await getPrismaClient().order.findMany({
      where: actor.role === 'ADMIN' ? {} : assigned(actorUserId),
      include: { physical: true, digital: true, cancellations: { orderBy: { createdAt: 'asc' } } },
      orderBy: { acceptedAt: 'desc' },
    })
    return rows.map(toItem)
  }

  async read(actorUserId: string, orderId: string): Promise<StudioOrderItem> {
    await this.staff(actorUserId)
    const order = await getPrismaClient().order.findFirst({
      where: { id: orderId, ...(await this.scope(actorUserId)) },
      include: { physical: true, digital: true, cancellations: { orderBy: { createdAt: 'asc' } } },
    })
    if (!order) throw new NotFoundException()
    return toItem(order)
  }

  async advance(actorUserId: string, orderId: string, track: 'physical' | 'digital') {
    const current = await this.read(actorUserId, orderId)
    if (track === 'physical') {
      const next = PHYSICAL_NEXT[current.physicalStage as keyof typeof PHYSICAL_NEXT]
      if (!next) throw new NotFoundException()
      return this.fulfillment.advancePhysical(orderId, next)
    }
    const next = DIGITAL_NEXT[current.digitalStage as keyof typeof DIGITAL_NEXT]
    if (!next) throw new NotFoundException()
    return this.fulfillment.advanceDigital(orderId, next)
  }

  async decideCancellation(
    actorUserId: string,
    orderId: string,
    cancellationId: string,
    approve: boolean,
    reason: string,
  ): Promise<void> {
    await this.read(actorUserId, orderId)
    const row = await getPrismaClient().cancellationRequest.findFirst({ where: { id: cancellationId, orderId } })
    if (!row) throw new NotFoundException()
    await this.cancellations.decide(actorUserId, cancellationId, approve, reason)
  }

  async hold(actorUserId: string, orderId: string, reason: string): Promise<void> {
    await this.read(actorUserId, orderId)
    await this.production.hold(actorUserId, orderId, reason)
  }

  async failQuality(actorUserId: string, orderId: string, reason: string): Promise<void> {
    await this.read(actorUserId, orderId)
    await this.production.failQuality(actorUserId, orderId, reason)
  }

  async recordShipment(actorUserId: string, orderId: string, reason: string): Promise<void> {
    await this.read(actorUserId, orderId)
    await this.shipments.recordException(actorUserId, orderId, reason)
  }

  private async staff(actorUserId: string) {
    const actor = await getPrismaClient().user.findFirst({
      where: { id: actorUserId, status: 'ACTIVE', role: { in: ['STUDIO', 'ADMIN'] } },
    })
    if (!actor) throw new NotFoundException()
    return actor
  }

  private async scope(actorUserId: string) {
    const actor = await this.staff(actorUserId)
    return actor.role === 'ADMIN' ? {} : assigned(actorUserId)
  }
}

function assigned(staffUserId: string) {
  return {
    request: { project: { assignments: { some: { staffUserId, revokedAt: null } } } },
  }
}

function toItem(order: {
  id: string
  status: string
  isFixture: boolean
  physical: { stage: string } | null
  digital: { stage: string } | null
  cancellations: { id: string; state: string; reason: string }[]
}): StudioOrderItem {
  return {
    orderId: order.id,
    status: order.status,
    isFixture: order.isFixture,
    physicalStage: order.physical?.stage ?? null,
    digitalStage: order.digital?.stage ?? null,
    cancellations: order.cancellations.map((row) => ({
      cancellationId: row.id,
      state: row.state,
      reason: row.reason,
    })),
  }
}
