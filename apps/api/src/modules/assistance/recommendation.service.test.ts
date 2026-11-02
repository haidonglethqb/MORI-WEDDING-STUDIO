import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { RecommendationService } from './recommendation.service.js'

const slug = `rec-${Date.now()}`

describe('RecommendationService', () => {
  const service = new RecommendationService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.product.deleteMany({ where: { slug: { startsWith: slug } } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: slug } })
    await disconnectPrismaClient()
  })

  it('prices the style match from the published book', async () => {
    const prisma = getPrismaClient()
    const product = await prisma.product.create({
      data: {
        slug,
        name: 'Fixture minimal card',
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
    const variantId = product.variants[0]?.id ?? ''
    await prisma.priceBook.create({
      data: {
        versionLabel: slug,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: {
            variantId,
            quantityMin: 1,
            quantityMax: 20,
            unitAmountVnd: 50_000n,
            setupAmountVnd: 100_000n,
          },
        },
      },
    })

    const ranked = await service.recommend({
      productType: 'PAPER',
      shape: 'FLAT',
      styles: ['minimalist'],
      colours: [],
      quantity: 2,
      budgetVnd: 1_000_000n,
      budgetBasis: 'TOTAL',
    })
    const match = ranked.results.find((item) => item.productId === product.id)
    expect(match?.merchandiseVnd).toBe('200000')
    expect(ranked.results.every((item) => item.productId !== 'invented')).toBe(true)
  })
})