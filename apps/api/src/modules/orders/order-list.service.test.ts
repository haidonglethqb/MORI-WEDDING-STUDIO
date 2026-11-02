import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { OrderReadService } from './order-read.service.js'

const ownerEmail = `orders-owner-${Date.now()}@example.com`
const otherEmail = `orders-other-${Date.now()}@example.com`

describe('owner order list', () => {
  const orders = new OrderReadService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lists only the customer orders', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Secret project' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ACCEPTED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'list-hash',
        isFixture: true,
      },
    })
    const order = await prisma.order.create({
      data: {
        requestId: request.id,
        quoteId: quote.id,
        ownerUserId: owner.id,
        totalAmountVnd: 900_000n,
        isFixture: true,
        physical: { create: { stage: 'PENDING' } },
      },
    })

    const mine = await orders.listForOwner(owner.id)
    expect(mine).toEqual([
      {
        orderId: order.id,
        status: 'SUBMITTED',
        currency: 'VND',
        totalAmountVnd: '900000',
        physicalStage: 'PENDING',
        digitalStage: null,
      },
    ])
    expect(JSON.stringify(mine)).not.toContain('Secret project')
    expect(await orders.listForOwner(other.id)).toEqual([])
  })
})