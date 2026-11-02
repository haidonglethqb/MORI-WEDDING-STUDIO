import { afterAll, describe, expect, it } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from '../modules/orders/place-order.service.js'
import { assertMutationOrigin } from './origin-guard.js'

const email = `origin-order-${Date.now()}@example.com`

describe('order origin', () => {
  const orders = new PlaceOrderService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses a foreign origin before placing an order', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Origin order' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'origin-order-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'origin-order-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'origin-order-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    const command = {
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'origin-order',
    }

    await expect(run('https://evil.example', () => orders.placeOrder(command))).rejects.toBeInstanceOf(
      ForbiddenException,
    )
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)

    const placed = await run('http://app.mori.localhost', () => orders.placeOrder(command))
    expect(placed.status).toBe('SUBMITTED')
    expect(placed.totalAmountVnd).toBe('900000')
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(1)
  })
})

async function run<T>(origin: string | undefined, action: () => Promise<T>): Promise<T> {
  assertMutationOrigin(origin)
  return action()
}
