import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CatalogueService } from './catalogue.service.js'

const slug = `cat-${Date.now()}`

describe('CatalogueService', () => {
  const catalogue = new CatalogueService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.product.deleteMany({ where: { slug: { startsWith: slug } } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: slug } })
    await disconnectPrismaClient()
  })

  it('lists active priced designs and withholds tri-fold and archived rows', async () => {
    const prisma = getPrismaClient()
    const live = await prisma.product.create({
      data: {
        slug,
        name: 'Fixture ivory card',
        type: 'PAPER',
        description: 'Fixture',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['minimalist'],
        variants: {
          create: [
            { shape: 'FLAT', availability: 'AVAILABLE' },
            { shape: 'TRIFOLD', availability: 'AVAILABLE' },
          ],
        },
      },
      include: { variants: true },
    })
    await prisma.product.create({
      data: {
        slug: `${slug}-old`,
        name: 'Archived card',
        type: 'PAPER',
        description: 'Fixture',
        state: 'ARCHIVED',
        isFixture: true,
        styleTags: ['minimalist'],
        variants: { create: { shape: 'FLAT', availability: 'AVAILABLE' } },
      },
    })
    const flat = live.variants.find((variant) => variant.shape === 'FLAT')
    await prisma.priceBook.create({
      data: {
        versionLabel: slug,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: {
            variantId: flat?.id ?? '',
            quantityMin: 1,
            quantityMax: 10,
            unitAmountVnd: 40_000n,
            setupAmountVnd: 0n,
          },
        },
      },
    })

    const listed = await catalogue.list({ style: 'minimalist', type: 'PAPER' })
    const card = listed.find((product) => product.slug === slug)
    expect(card?.isFixture).toBe(true)
    expect(card?.variants.find((variant) => variant.shape === 'FLAT')?.unitAmountVnd).toBe('40000')
    expect(card?.variants.find((variant) => variant.shape === 'TRIFOLD')?.availability).toBe(
      'UNAVAILABLE',
    )
    expect(listed.some((product) => product.slug === `${slug}-old`)).toBe(false)
  })
})