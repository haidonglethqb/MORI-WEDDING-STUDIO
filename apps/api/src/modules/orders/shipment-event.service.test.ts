import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { PlaceOrderService } from './place-order.service.js'
import { ShipmentEventService } from './shipment-event.service.js'

const ownerEmail = `ship-owner-${Date.now()}@example.com`
const staffEmail = `ship-staff-${Date.now()}@example.com`

describe('ShipmentEventService', () => {
  const fulfillment = new FulfillmentService()
  const shipments = new ShipmentEventService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('records a delivery exception without marking the order delivered', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const placed = await placePaper(owner.id)
    await prisma.order.update({ where: { id: placed.orderId }, data: { status: 'CONFIRMED' } })
    for (const stage of ['IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED'] as const) {
      await fulfillment.advancePhysical(placed.orderId, stage)
    }

    await expect(shipments.recordException(owner.id, placed.orderId, 'Không gặp người nhận')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    await shipments.recordException(staff.id, placed.orderId, 'Không gặp người nhận')

    const track = await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: placed.orderId },
      include: { shipment: { include: { events: true } } },
    })
    expect(track.stage).toBe('SHIPPED')
    expect(order.status).toBe('IN_FULFILLMENT')
    expect(order.shipment?.events[0]?.kind).toBe('EXCEPTION')
    expect(order.shipment?.events[0]?.reason).toBe('Không gặp người nhận')
    expect(order.shipment?.events[0]?.staffUserId).toBe(staff.id)
  })
})

async function placePaper(ownerId: string) {
  const prisma = getPrismaClient()
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: ownerId, internalTitle: 'Shipment' },
  })
  const request = await prisma.serviceRequest.create({
    data: { projectId: project.id, ownerUserId: ownerId, kind: 'PAPER', isFixture: true },
  })
  await prisma.designRevision.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: 'ship-hash',
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
      fontsReady: true,
      isFixture: true,
      approval: { create: { ownerUserId: ownerId, manifestHash: 'ship-hash', acknowledgementVersion: 'fixture-ack-1' } },
    },
  })
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'ISSUED',
      totalAmountVnd: 900_000n,
      expiresAt: new Date(Date.now() + 60_000),
      scopeFingerprint: 'ship-hash',
      shippingAmountVnd: 20_000n,
      taxAmountVnd: 10_000n,
      isFixture: true,
    },
  })
  return new PlaceOrderService().placeOrder({
    ownerUserId: ownerId,
    requestId: request.id,
    quoteId: quote.id,
    expectedVersion: 0,
    idempotencyKey: 'ship-key',
  })
}
