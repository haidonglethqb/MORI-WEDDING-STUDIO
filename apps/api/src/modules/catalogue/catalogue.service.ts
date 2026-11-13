import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CatalogueProduct, CatalogueQuery } from '@mori/contracts'
import { getFixtureCatalogue } from './catalogue-fixtures.js'

@Injectable()
export class CatalogueService {
  async list(query: CatalogueQuery): Promise<CatalogueProduct[]> {
    try {
      const products = await getPrismaClient().product.findMany({
        where: {
          state: 'ACTIVE',
          ...(query.type ? { type: query.type } : {}),
          ...(query.style ? { styleTags: { has: query.style } } : {}),
        },
        include: {
          variants: {
            include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
          },
        },
        orderBy: { name: 'asc' },
      })

      if (products.length > 0) {
        return products
          .map((product) => ({
            slug: product.slug,
            name: product.name,
            type: product.type,
            isFixture: product.isFixture,
            imageUrl: product.imageUrl ?? null,
            styleTags: product.styleTags,
            variants: product.variants
              .filter(
                (variant) =>
                  !query.shape || variant.shape === query.shape || variant.shape === 'TRIFOLD',
              )
              .map((variant) => toVariant(variant, query.shape)),
          }))
          .filter(
            (product) =>
              (product.type === 'DIGITAL' && !query.shape) ||
              product.variants.some((variant) => variant.availability !== 'UNAVAILABLE'),
          )
      }
    } catch {
      // Database not reachable, fall back to fixture catalogue per Hard Rule 12
    }

    return getFixtureCatalogue(query)
  }

  async archive(staffUserId: string, productId: string): Promise<void> {
    const prisma = getPrismaClient()
    const staff = await prisma.user.findFirst({
      where: { id: staffUserId, role: { in: ['STUDIO', 'ADMIN'] }, status: 'ACTIVE' },
    })
    if (!staff) throw new NotFoundException()
    const updated = await prisma.product.updateMany({
      where: { id: productId },
      data: { state: 'ARCHIVED' },
    })
    if (updated.count !== 1) throw new NotFoundException()
  }
}

function toVariant(
  variant: {
    id: string
    shape: 'FLAT' | 'BIFOLD' | 'TRIFOLD'
    availability: 'AVAILABLE' | 'UNAVAILABLE' | 'QUOTE_REQUIRED'
    priceRules: { quantityMin: number; unitAmountVnd: bigint }[]
  },
  shape: 'FLAT' | 'BIFOLD' | undefined,
): CatalogueProduct['variants'][number] {
  if (variant.shape === 'TRIFOLD' || (shape && variant.shape !== shape)) {
    return { id: variant.id, shape: variant.shape, availability: 'UNAVAILABLE', unitAmountVnd: null }
  }
  if (variant.availability !== 'AVAILABLE' || variant.priceRules.length === 0) {
    return {
      id: variant.id,
      shape: variant.shape,
      availability: 'QUOTE_REQUIRED',
      unitAmountVnd: null,
    }
  }
  const lowest = variant.priceRules.reduce((min, rule) =>
    rule.unitAmountVnd < min.unitAmountVnd ? rule : min,
  )
  return {
    id: variant.id,
    shape: variant.shape,
    availability: 'AVAILABLE',
    unitAmountVnd: lowest.unitAmountVnd.toString(),
  }
}
