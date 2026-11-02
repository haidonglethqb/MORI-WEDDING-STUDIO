import { afterAll, describe, expect, it } from 'vitest'
import { UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'

const email = `order-${Date.now()}@example.com`

describe('PlaceOrderService', () => {
  const service = new PlaceOrderService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('creates one order when two commands race', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Fixture order' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'order-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'order-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 2_450_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'order-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })

    const [first, second] = await Promise.all([
      service.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'same-key',
      }),
      service.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'same-key',
      }),
    ])

    expect(first.orderId).toBe(second.orderId)
    expect(first.totalAmountVnd).toBe('2450000')
    expect(first.messageCode).toBe('ORDER_REQUEST_RECEIVED')
    expect(Object.keys(first).sort()).toEqual([
      'currency',
      'messageCode',
      'orderId',
      'quoteId',
      'status',
      'totalAmountVnd',
    ])
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(1)
    expect((await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } })).state).toBe('ACCEPTED')

    await expect(
      service.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 1,
        idempotencyKey: 'same-key',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(1)
  })
})
