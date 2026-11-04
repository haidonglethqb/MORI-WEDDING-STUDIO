import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `cancel-owner-${Date.now()}@example.com`
const staffEmail = `cancel-staff-${Date.now()}@example.com`
const otherEmail = `cancel-other-${Date.now()}@example.com`

describe('CancellationRequestService', () => {
  const fulfillment = new FulfillmentService()
  const cancellations = new CancellationRequestService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps a started production stage when a cancellation is approved', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const started = await placePaper(owner.id, 'started')
    await prisma.order.update({ where: { id: started.orderId }, data: { status: 'CONFIRMED' } })
    await fulfillment.advancePhysical(started.orderId, 'IN_PRODUCTION')
    const waiting = await placePaper(owner.id, 'waiting')

    await expect(cancellations.request(other.id, started.orderId, 'Đổi kế hoạch')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    const requested = await cancellations.request(owner.id, started.orderId, 'Đổi kế hoạch')
    await cancellations.decide(staff.id, requested.id, true, 'Đã vào in')
    const startedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: started.orderId },
      include: { physical: true, cancellations: true },
    })
    expect(startedOrder.status).toBe('IN_FULFILLMENT')
    expect(startedOrder.physical?.stage).toBe('IN_PRODUCTION')
    expect(startedOrder.cancellations[0]?.outcome).toBe('EXCEPTION_AFTER_WORK')

    const early = await cancellations.request(owner.id, waiting.orderId, 'Chưa cần in')
    await cancellations.decide(staff.id, early.id, true, 'Chưa vào in')
    const waitingOrder = await prisma.order.findUniqueOrThrow({
      where: { id: waiting.orderId },
      include: { physical: true, cancellations: true },
    })
    expect(waitingOrder.status).toBe('CANCELLED')
    expect(waitingOrder.physical?.stage).toBe('PENDING')
    expect(waitingOrder.cancellations[0]?.outcome).toBe('CANCELLED_BEFORE_WORK')
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
  return new PlaceOrderService().placeOrder({
    ownerUserId: ownerId,
    requestId: request.id,
    quoteId: quote.id,
    expectedVersion: 0,
    idempotencyKey: `${label}-key`,
  })
}
