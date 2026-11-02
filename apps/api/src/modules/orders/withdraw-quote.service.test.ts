import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'
import { WithdrawQuoteService } from './withdraw-quote.service.js'

const email = `withdraw-${Date.now()}@example.com`

describe('WithdrawQuoteService', () => {
  const orders = new PlaceOrderService()
  const quotes = new WithdrawQuoteService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('lets withdrawal and placement finish as one outcome', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Withdraw race' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'withdraw-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'withdraw-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 1_200_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'withdraw-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })

    const results = await Promise.allSettled([
      orders.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'withdraw-race',
      }),
      quotes.withdraw(quote.id),
    ])
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException)

    const stored = await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } })
    const orderCount = await prisma.order.count({ where: { requestId: request.id } })
    if (orderCount === 1) {
      expect(stored.state).toBe('ACCEPTED')
    } else {
      expect(orderCount).toBe(0)
      expect(stored.state).toBe('WITHDRAWN')
    }
  })
})