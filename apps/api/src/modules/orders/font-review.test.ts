import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { FontReviewService } from './font-review.service.js'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `font-owner-${Date.now()}@example.com`
const staffEmail = `font-staff-${Date.now()}@example.com`

describe('font preflight', () => {
  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('blocks production until staff records the font requirement', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Fonts' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'font-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: false,
        isFixture: true,
        approval: {
          create: { ownerUserId: owner.id, manifestHash: 'font-hash', acknowledgementVersion: 'fixture-ack-1' },
        },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'font-hash',
        isFixture: true,
      },
    })
    const placed = await new PlaceOrderService().placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'font-key',
    })
    await prisma.order.update({ where: { id: placed.orderId }, data: { status: 'CONFIRMED' } })
    const fulfillment = new FulfillmentService()
    await expect(fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')).rejects.toThrow(
      /Font requirements are missing/,
    )
    expect((await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })).stage).toBe(
      'PENDING',
    )

    await expect(new FontReviewService().accept(owner.id, revision.id)).rejects.toBeInstanceOf(NotFoundException)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: revision.id } })).fontsReady).toBe(false)

    await new FontReviewService().accept(staff.id, revision.id)
    await fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')
    expect((await prisma.physicalFulfillment.findUniqueOrThrow({ where: { orderId: placed.orderId } })).stage).toBe(
      'IN_PRODUCTION',
    )
  })
})