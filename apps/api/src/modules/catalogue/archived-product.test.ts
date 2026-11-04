import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { RecommendationService } from '../assistance/recommendation.service.js'
import { OrderReadService } from '../orders/order-read.service.js'
import { PlaceOrderService } from '../orders/place-order.service.js'
import { CatalogueService } from './catalogue.service.js'

const slug = `archived-${Date.now()}`
const ownerEmail = `archived-owner-${Date.now()}@example.com`
const staffEmail = `archived-staff-${Date.now()}@example.com`

describe('archived product', () => {
  const catalogue = new CatalogueService()
  const recommendations = new RecommendationService()
  const reader = new OrderReadService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.product.deleteMany({ where: { slug } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: slug } })
    await prisma.user.deleteMany({ where: { normalizedEmail: { in: [ownerEmail, staffEmail] } } })
    await disconnectPrismaClient()
  })

  it('hides an archived product and keeps the accepted order total', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const product = await prisma.product.create({
      data: {
        slug,
        name: 'Fixture archive card',
        type: 'PAPER',
        description: 'Fixture',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['minimalist'],
        colourTags: ['ivory'],
        variants: { create: { shape: 'FLAT', availability: 'AVAILABLE' } },
      },
      include: { variants: true },
    })
    await prisma.priceBook.create({
      data: {
        versionLabel: slug,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: {
            variantId: product.variants[0]?.id ?? '',
            quantityMin: 1,
            quantityMax: 10,
            unitAmountVnd: 40_000n,
            setupAmountVnd: 0n,
          },
        },
      },
    })
    const placed = await placePaper(owner.id)
    const before = await reader.read(owner.id, placed.orderId)
    const preference = {
      productType: 'PAPER' as const,
      shape: 'FLAT' as const,
      styles: ['minimalist'],
      colours: [] as string[],
      quantity: 2,
      budgetVnd: 1_000_000n,
      budgetBasis: 'TOTAL' as const,
    }
    expect((await catalogue.list({ type: 'PAPER', style: 'minimalist' })).some((item) => item.slug === slug)).toBe(
      true,
    )
    expect((await recommendations.recommend(preference)).results.some((item) => item.productId === product.id)).toBe(
      true,
    )

    await expect(catalogue.archive(owner.id, product.id)).rejects.toBeInstanceOf(NotFoundException)
    await catalogue.archive(staff.id, product.id)

    expect((await catalogue.list({ type: 'PAPER', style: 'minimalist' })).some((item) => item.slug === slug)).toBe(
      false,
    )
    const ranked = await recommendations.recommend(preference)
    expect(ranked.results.some((item) => item.productId === product.id)).toBe(false)
    expect(await reader.read(owner.id, placed.orderId)).toEqual(before)
  })
})

async function placePaper(ownerId: string) {
  const prisma = getPrismaClient()
  const project = await prisma.weddingProject.create({
    data: { ownerUserId: ownerId, internalTitle: 'Archive order' },
  })
  const request = await prisma.serviceRequest.create({
    data: { projectId: project.id, ownerUserId: ownerId, kind: 'PAPER', isFixture: true },
  })
  await prisma.designRevision.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: 'archive-hash',
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
      fontsReady: true,
      isFixture: true,
      approval: { create: { ownerUserId: ownerId, manifestHash: 'archive-hash', acknowledgementVersion: 'fixture-ack-1' } },
    },
  })
  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      sequence: 1,
      state: 'ISSUED',
      totalAmountVnd: 900_000n,
      expiresAt: new Date(Date.now() + 60_000),
      scopeFingerprint: 'archive-hash',
      shippingAmountVnd: 20_000n,
      taxAmountVnd: 10_000n,
      isFixture: true,
    },
  })
  return new PlaceOrderService().placeOrder({
    ownerUserId: ownerId,
    requestId: request.id,
    quoteId: quote.id,
    expectedVersion: 0,
    idempotencyKey: 'archive-key',
  })
}
