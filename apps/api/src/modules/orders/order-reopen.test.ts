import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { OrderConfirmService } from './order-confirm.service.js'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `reopen-owner-${Date.now()}@example.com`
const staffEmail = `reopen-staff-${Date.now()}@example.com`

describe('cancelled order', () => {
  const orders = new PlaceOrderService()
  const cancellations = new CancellationRequestService()
  const confirm = new OrderConfirmService()
  const fulfillment = new FulfillmentService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps a cancelled order closed and allows a new request', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const first = await placePaper(owner.id, 'first')
    const requested = await cancellations.request(owner.id, first.orderId, 'Chưa cần')
    await cancellations.decide(staff.id, requested.id, true, 'Chưa vào in')

    await expect(orders.placeOrder({
      ownerUserId: owner.id,
      requestId: first.requestId,
      quoteId: first.quoteId,
      expectedVersion: 1,
      idempotencyKey: 'reopen-key',
    })).rejects.toBeInstanceOf(ConflictException)
    await expect(confirm.confirm(staff.id, first.orderId)).rejects.toBeInstanceOf(ConflictException)
    await expect(fulfillment.advancePhysical(first.orderId, 'IN_PRODUCTION')).rejects.toBeInstanceOf(
      ConflictException,
    )
    const closed = await prisma.order.findUniqueOrThrow({
      where: { id: first.orderId },
      include: { physical: true },
    })
    expect(closed.status).toBe('CANCELLED')
    expect(closed.physical?.stage).toBe('PENDING')
    expect(await prisma.order.count({ where: { requestId: first.requestId } })).toBe(1)

    const second = await placePaper(owner.id, 'second')
    expect(second.orderId).not.toBe(first.orderId)
    expect(second.status).toBe('SUBMITTED')
  })
})

async function placePaper(ownerId: string, label: string) {
  const prisma = getPrismaClient()
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: ownerId, internalTitle: label },
  })
  const request = await prisma.serviceRequest.create({
    data: { projectId: project.id, ownerUserId: ownerId, kind: 'PAPER', isFixture: true },
  })
  await prisma.designRevision.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: `${label}-hash`,
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
      fontsReady: true,
      isFixture: true,
      approval: { create: { ownerUserId: ownerId, manifestHash: `${label}-hash`, acknowledgementVersion: 'fixture-ack-1' } },
    },
  })
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'ISSUED',
      totalAmountVnd: 900_000n,
      expiresAt: new Date(Date.now() + 60_000),
      scopeFingerprint: `${label}-hash`,
      shippingAmountVnd: 20_000n,
      taxAmountVnd: 10_000n,
      isFixture: true,
    },
  })
  const placed = await new PlaceOrderService().placeOrder({
    ownerUserId: ownerId,
    requestId: request.id,
    quoteId: quote.id,
    expectedVersion: 0,
    idempotencyKey: `${label}-key`,
  })
  return { ...placed, requestId: request.id, quoteId: quote.id }
}
