import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { OrderConfirmService } from './order-confirm.service.js'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `confirm-owner-${Date.now()}@example.com`
const staffEmail = `confirm-staff-${Date.now()}@example.com`

describe('OrderConfirmService', () => {
  const confirm = new OrderConfirmService()
  const fulfillment = new FulfillmentService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lets the studio confirm a submitted order without changing the total', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const placed = await placePaper(owner.id)
    const before = await prisma.order.findUniqueOrThrow({
      where: { id: placed.orderId },
      include: { physical: true },
    })

    await expect(confirm.confirm(owner.id, placed.orderId)).rejects.toBeInstanceOf(NotFoundException)
    await expect(fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect((await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })).stage).toBe(
      'PENDING',
    )
    const result = await confirm.confirm(staff.id, placed.orderId)
    expect(result).toEqual({ status: 'CONFIRMED', totalAmountVnd: '900000' })
    const after = await prisma.order.findUniqueOrThrow({
      where: { id: placed.orderId },
      include: { physical: true },
    })
    expect(after.status).toBe('CONFIRMED')
    expect(after.totalAmountVnd).toBe(before.totalAmountVnd)
    expect(after.physical?.stage).toBe('PENDING')
    const started = await fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')
    expect(started.status).toBe('IN_FULFILLMENT')
    expect((await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })).stage).toBe(
      'IN_PRODUCTION',
    )
    await expect(confirm.confirm(staff.id, placed.orderId)).rejects.toBeInstanceOf(ConflictException)
    expect((await prisma.order.findUniqueOrThrow({ where: { id: placed.orderId } })).status).toBe('IN_FULFILLMENT')
  })
})

async function placePaper(ownerId: string) {
  const prisma = getPrismaClient()
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: ownerId, internalTitle: 'Confirm' },
  })
  const request = await prisma.serviceRequest.create({
    data: { projectId: project.id, ownerUserId: ownerId, kind: 'PAPER', isFixture: true },
  })
  await prisma.designRevision.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: 'confirm-hash',
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
      fontsReady: true,
      isFixture: true,
      approval: { create: { ownerUserId: ownerId, manifestHash: 'confirm-hash', acknowledgementVersion: 'fixture-ack-1' } },
    },
  })
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'ISSUED',
      totalAmountVnd: 900_000n,
      expiresAt: new Date(Date.now() + 60_000),
      scopeFingerprint: 'confirm-hash',
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
    idempotencyKey: 'confirm-key',
  })
}
