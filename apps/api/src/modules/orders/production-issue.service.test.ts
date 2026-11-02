import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { PlaceOrderService } from './place-order.service.js'
import { ProductionIssueService } from './production-issue.service.js'

const ownerEmail = `qc-owner-${Date.now()}@example.com`
const staffEmail = `qc-staff-${Date.now()}@example.com`

describe('ProductionIssueService', () => {
  const fulfillment = new FulfillmentService()
  const issues = new ProductionIssueService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('returns a failed quality check to production and holds without changing the stage', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const placed = await placePaper(owner.id)
    await prisma.order.update({ where: { id: placed.orderId }, data: { status: 'CONFIRMED' } })
    await fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')
    await fulfillment.advancePhysical(placed.orderId, 'QUALITY_CHECK')

    await expect(issues.failQuality(owner.id, placed.orderId, 'Lệch màu')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    await issues.failQuality(staff.id, placed.orderId, 'Lệch màu')
    const rework = await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })
    const note = await prisma.productionIssue.findFirstOrThrow({ where: { orderId: placed.orderId } })
    const order = await prisma.order.findUniqueOrThrow({ where: { id: placed.orderId } })
    expect(rework.stage).toBe('IN_PRODUCTION')
    expect(order.status).toBe('IN_FULFILLMENT')
    expect(note.reason).toBe('Lệch màu')
    expect(note.staffUserId).toBe(staff.id)

    await issues.hold(staff.id, placed.orderId, 'Hết giấy')
    const held = await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })
    expect(held.stage).toBe('IN_PRODUCTION')
    expect(held.onHold).toBe(true)
    expect(held.holdReason).toBe('Hết giấy')
    expect(held.heldByUserId).toBe(staff.id)
  })
})

async function placePaper(ownerId: string) {
  const prisma = getPrismaClient()
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: ownerId, internalTitle: 'QC' },
  })
  const request = await prisma.serviceRequest.create({
    data: { projectId: project.id, ownerUserId: ownerId, kind: 'PAPER', isFixture: true },
  })
  await prisma.designRevision.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: 'qc-hash',
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
      fontsReady: true,
      isFixture: true,
      approval: { create: { ownerUserId: ownerId, manifestHash: 'qc-hash', acknowledgementVersion: 'fixture-ack-1' } },
    },
  })
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'ISSUED',
      totalAmountVnd: 900_000n,
      expiresAt: new Date(Date.now() + 60_000),
      scopeFingerprint: 'qc-hash',
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
    idempotencyKey: 'qc-key',
  })
}
