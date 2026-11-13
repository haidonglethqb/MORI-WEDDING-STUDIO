import { getPrismaClient } from '@mori/database'
import { CATALOGUE_PRODUCTS } from './catalogue-data.js'

export const DEV_PRICE_BOOK_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Idempotently synchronize all active products, image URLs, variants, and VND price rules
 * into PostgreSQL, archiving removed fixture slugs without deleting referenced rows.
 */
export async function syncCatalogue(): Promise<{ productCount: number }> {
  const prisma = getPrismaClient()
  const priceBook = await prisma.priceBook.upsert({
    where: { id: DEV_PRICE_BOOK_ID },
    update: { state: 'PUBLISHED', isFixture: false, versionLabel: 'dev-2026-v1' },
    create: {
      id: DEV_PRICE_BOOK_ID,
      versionLabel: 'dev-2026-v1',
      currency: 'VND',
      state: 'PUBLISHED',
      isFixture: false,
    },
  })

  // Unpublish leftover fixture-only price books so estimates do not retain stale mock prices.
  await prisma.priceBook.updateMany({
    where: { id: { not: DEV_PRICE_BOOK_ID }, isFixture: true, state: 'PUBLISHED' },
    data: { state: 'DRAFT' },
  })

  const activeSlugs = CATALOGUE_PRODUCTS.map((item) => item.slug)
  await prisma.product.updateMany({
    where: { slug: { notIn: activeSlugs }, state: { not: 'ARCHIVED' } },
    data: { state: 'ARCHIVED' },
  })

  for (const item of CATALOGUE_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        type: item.type,
        description: item.description,
        imageUrl: item.imageUrl,
        state: 'ACTIVE',
        isFixture: false,
        styleTags: item.styleTags,
        colourTags: item.colourTags,
      },
      create: {
        slug: item.slug,
        name: item.name,
        type: item.type,
        description: item.description,
        imageUrl: item.imageUrl,
        state: 'ACTIVE',
        isFixture: false,
        styleTags: item.styleTags,
        colourTags: item.colourTags,
      },
    })

    if (!item.shape) continue

    const existingVariant = await prisma.productVariant.findFirst({
      where: { productId: product.id, shape: item.shape },
    })
    const variant = existingVariant
      ? existingVariant.availability === 'AVAILABLE'
        ? existingVariant
        : await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: { availability: 'AVAILABLE' },
          })
      : await prisma.productVariant.create({
          data: { productId: product.id, shape: item.shape, availability: 'AVAILABLE' },
        })

    await prisma.priceRule.deleteMany({
      where: { priceBookId: priceBook.id, variantId: variant.id },
    })
    await prisma.priceRule.create({
      data: {
        priceBookId: priceBook.id,
        variantId: variant.id,
        quantityMin: 1,
        quantityMax: 10000,
        unitAmountVnd: item.unitAmountVnd,
        setupAmountVnd: 0n,
      },
    })
  }

  return { productCount: CATALOGUE_PRODUCTS.length }
}
