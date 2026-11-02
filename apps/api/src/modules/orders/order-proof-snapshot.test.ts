import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { PlaceOrderService } from './place-order.service.js'

const email = `proof-snapshot-${Date.now()}@example.com`

describe('order proof snapshot', () => {
  const orders = new PlaceOrderService()
  const fulfillment = new FulfillmentService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('prints the approved revision after a newer draft exists', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Snapshot' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const approved = await prisma.designRevision.create({
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
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    const placed = await orders.placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'snapshot-key',
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 2,
        state: 'WORKING',
        manifestHash: 'hash-draft',
        trimWidthMm: 90,
        trimHeightMm: 140,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
      },
    })

    await prisma.order.update({ where: { id: placed.orderId }, data: { status: 'CONFIRMED' } })
    const started = await fulfillment.advancePhysical(placed.orderId, 'IN_PRODUCTION')
    const track = await prisma.physicalFulfillment.findUniqueOrThrow({
      where: { orderId: placed.orderId },
      include: { proofRevision: true },
    })
    expect(started.status).toBe('IN_FULFILLMENT')
    expect(track.proofRevisionId).toBe(approved.id)
    expect(track.proofRevision?.manifestHash).toBe('hash-approved')
  })
})