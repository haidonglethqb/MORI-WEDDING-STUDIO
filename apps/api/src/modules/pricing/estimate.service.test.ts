import { afterAll, describe, expect, it } from 'vitest'
import { BadRequestException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { EstimateService } from './estimate.service.js'

const slug = `fixture-card-${Date.now()}`

describe('EstimateService', () => {
  const service = new EstimateService()
  let variantId = ''
  let triFoldId = ''

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.product.deleteMany({ where: { slug } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: slug, isFixture: true } })
    await disconnectPrismaClient()
  })

  it('prices from the published book and rejects tri-fold', async () => {
    const prisma = getPrismaClient()
    const product = await prisma.product.create({
      data: {
        slug,
        name: 'Fixture flat card',
        type: 'PAPER',
        description: 'Fixture, not a real offer',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['minimalist'],
        colourTags: ['ivory'],
        variants: {
          create: [
            { shape: 'FLAT', availability: 'AVAILABLE' },
            { shape: 'TRIFOLD', availability: 'AVAILABLE' },
          ],
        },
      },
      include: { variants: true },
    })
    const flat = product.variants.find((variant) => variant.shape === 'FLAT')
    const tri = product.variants.find((variant) => variant.shape === 'TRIFOLD')
    variantId = flat?.id ?? ''
    triFoldId = tri?.id ?? ''
    await prisma.priceBook.create({
      data: {
        versionLabel: slug,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: {
            variantId,
            quantityMin: 1,
            quantityMax: 10,
            unitAmountVnd: 50_000n,
            setupAmountVnd: 100_000n,
          },
        },
      },
    })

    const estimate = await service.estimate({ variantId, quantity: 2 })
    expect(estimate.merchandiseVnd).toBe('200000')
    expect(estimate.totalVnd).toBeNull()
    expect(estimate.unresolved).toEqual(['shipping', 'tax'])
    expect(estimate.quoteRequired).toBe(false)
    await expect(service.estimate({ variantId: triFoldId, quantity: 2 })).rejects.toBeInstanceOf(
      BadRequestException,
    )
  })
})
