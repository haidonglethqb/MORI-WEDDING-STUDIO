import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'

const email = `unresolved-${Date.now()}@example.com`

describe('unresolved quote charges', () => {
  const orders = new PlaceOrderService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses an order when shipping or tax is still empty', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Unresolved' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'hash-approved',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'hash-approved', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'hash-approved',
        isFixture: true,
      },
    })

    await expect(
      orders.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'unresolved-key',
      }),
    ).rejects.toMatchObject({ response: { code: 'CHARGE_UNRESOLVED' } })
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)
    expect((await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } })).state).toBe('ISSUED')
  })
})