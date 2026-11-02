import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `ship-owner-${Date.now()}@example.com`
const otherEmail = `ship-other-${Date.now()}@example.com`

describe('order address snapshot', () => {
  const orders = new PlaceOrderService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('copies the owner address onto the order and leaves that copy unchanged', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Ship secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'ship-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: {
          create: { ownerUserId: owner.id, manifestHash: 'ship-hash', acknowledgementVersion: 'ack-1' },
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
        expiresAt: new Date(Date.now() + 86_400_000),
        scopeFingerprint: 'ship-hash',
        isFixture: true,
      },
    })
    const address = await prisma.address.create({
      data: {
        ownerUserId: owner.id,
        recipientName: 'Mai Trần',
        phone: '0900000001',
        addressLines: '12 đường cũ',
        locality: 'Quận 1',
        province: 'Hồ Chí Minh',
        countryCode: 'VN',
      },
    })
    const foreign = await prisma.address.create({
      data: {
        ownerUserId: other.id,
        recipientName: 'Người khác',
        phone: '0900000002',
        addressLines: '99 đường kín',
        locality: 'Quận 3',
        province: 'Hồ Chí Minh',
        countryCode: 'VN',
      },
    })

    await expect(
      orders.placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 0,
        idempotencyKey: 'ship-foreign',
        shippingAddressId: foreign.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)

    const placed = await orders.placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'ship-own',
      shippingAddressId: address.id,
    })
    await prisma.address.update({ where: { id: address.id }, data: { addressLines: '12 đường mới', locality: 'Quận 7' } })
    const stored = await prisma.order.findUniqueOrThrow({ where: { id: placed.orderId } })
    expect(stored.shipRecipientName).toBe('Mai Trần')
    expect(stored.shipAddressLines).toBe('12 đường cũ')
    expect(stored.shipLocality).toBe('Quận 1')
    expect(stored.shipAddressLines).not.toBe('99 đường kín')
  })
})
