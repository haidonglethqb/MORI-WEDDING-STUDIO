import { afterAll, describe, expect, it } from 'vitest'
import { UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { placeOrderCommand } from './place-order-command.js'

const ownerEmail = `place-cmd-owner-${Date.now()}@example.com`
const otherEmail = `place-cmd-other-${Date.now()}@example.com`

describe('placeOrderCommand', () => {
  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('rejects a client total and stores the quote amount', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Place command' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'place-cmd-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'place-cmd-hash', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'place-cmd-hash',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    const body = {
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'place-cmd',
    }

    await expect(placeOrderCommand(owner.id, {
      ...body,
      role: 'ADMIN',
      ownerUserId: other.id,
      totalAmountVnd: '1',
    })).rejects.toBeInstanceOf(UnprocessableEntityException)
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)

    const placed = await placeOrderCommand(owner.id, body)
    expect(placed.totalAmountVnd).toBe('900000')
    expect(placed.status).toBe('SUBMITTED')
    const stored = await prisma.order.findUniqueOrThrow({ where: { requestId: request.id } })
    expect(stored.ownerUserId).toBe(owner.id)
    expect(stored.totalAmountVnd).toBe(900_000n)
  })
})