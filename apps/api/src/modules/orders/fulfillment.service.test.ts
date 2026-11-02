import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { PlaceOrderService } from './place-order.service.js'

const email = `bundle-${Date.now()}@example.com`
const blockedEmail = `blocked-${Date.now()}@example.com`

describe('FulfillmentService', () => {
  const orders = new PlaceOrderService()
  const fulfillment = new FulfillmentService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [email, blockedEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps a bundle open until both tracks finish', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Bundle' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'BUNDLE', isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 1_000_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'bundle-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'bundle-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'bundle-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const placed = await orders.placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'bundle-key',
    })

    await prisma.order.update({ where: { id: placed.orderId }, data: { status: 'CONFIRMED' } })
    await expect(fulfillment.advanceDigital(placed.orderId, 'HANDED_OVER')).rejects.toBeInstanceOf(
      ConflictException,
    )
    await fulfillment.advanceDigital(placed.orderId, 'IN_PROGRESS')
    await fulfillment.advanceDigital(placed.orderId, 'READY_FOR_HANDOVER')
    const afterDigital = await fulfillment.advanceDigital(placed.orderId, 'HANDED_OVER')
    expect(afterDigital.status).toBe('IN_FULFILLMENT')

    for (const stage of ['IN_PRODUCTION', 'QUALITY_CHECK', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'] as const) {
      await fulfillment.advancePhysical(placed.orderId, stage)
    }
    const finished = await prisma.order.findUniqueOrThrow({ where: { id: placed.orderId } })
    expect(finished.status).toBe('COMPLETED')
  })

  it('refuses a paper order when no proof is approved', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: blockedEmail, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Blocked' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 1_000_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'blocked-fixture',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    await expect(
      orders.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'blocked-key',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)
  })
})