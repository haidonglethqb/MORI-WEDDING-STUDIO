import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'

const email = `quote-expired-${Date.now()}@example.com`

describe('expired quote', () => {
  const service = new PlaceOrderService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses an order when the database says the quote has expired', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Expired quote' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 1_500_000n,
        expiresAt: new Date('2099-01-01T00:00:00.000Z'),
        scopeFingerprint: 'fixture-expired',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    await prisma.$executeRaw`
      UPDATE quotes
      SET "expiresAt" = NOW() - interval '1 second'
      WHERE id = ${quote.id}::uuid
    `

    await expect(
      service.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'expired-key',
      }),
    ).rejects.toMatchObject({ response: { code: 'QUOTE_EXPIRED' } })

    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)
    expect((await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } })).state).toBe('ISSUED')
  })
})