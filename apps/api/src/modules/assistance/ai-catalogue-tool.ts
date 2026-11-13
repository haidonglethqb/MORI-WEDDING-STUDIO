import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CatalogProductItem } from './assistant-types.js'

@Injectable()
export class AiCatalogueTool {
  private isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production'
  }

  async listActiveProducts(): Promise<CatalogProductItem[]> {
    try {
      const products = await getPrismaClient().product.findMany({
        where: { state: 'ACTIVE', type: 'PAPER' },
        include: {
          variants: {
            where: { shape: { not: 'TRIFOLD' }, availability: { not: 'UNAVAILABLE' } },
            include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
          },
        },
      })

      if (!products.length) {
        return []
      }

      return products.map((p) => {
        const v = p.variants[0]
        const firstRule = v?.priceRules[0]
        const unitPriceVnd = firstRule ? BigInt(firstRule.unitAmountVnd) : 0n
        const formattedPriceVnd =
          unitPriceVnd > 0n
            ? `${Number(unitPriceVnd).toLocaleString('vi-VN')} ₫`
            : 'Báo giá theo yêu cầu'

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          shape: v?.shape ?? 'FLAT',
          styleTags: p.styleTags ?? [],
          colourTags: p.colourTags ?? [],
          unitPriceVnd,
          formattedPriceVnd,
          imageUrl: p.imageUrl ?? null,
          isFixture: p.isFixture ?? false,
        }
      })
    } catch {
      return []
    }
  }

  async findVariantBySlugAndShape(
    slug: string,
    shape?: string,
  ): Promise<{ variantId: string; quoteRequired: boolean; isAvailable: boolean } | null> {
    try {
      const product = await getPrismaClient().product.findUnique({
        where: { slug },
        include: { variants: true },
      })
      if (!product || product.state !== 'ACTIVE') return null

      const targetShape = shape?.toUpperCase()
      const variant =
        product.variants.find((v) => targetShape && v.shape === targetShape) ??
        product.variants.find((v) => v.shape !== 'TRIFOLD' && v.availability !== 'UNAVAILABLE') ??
        product.variants[0]

      if (!variant) return null

      return {
        variantId: variant.id,
        quoteRequired: variant.availability === 'QUOTE_REQUIRED',
        isAvailable: variant.availability !== 'UNAVAILABLE' && variant.shape !== 'TRIFOLD',
      }
    } catch {
      return null
    }
  }

  async getProductBySlug(slug: string): Promise<CatalogProductItem | null> {
    const list = await this.listActiveProducts()
    return list.find((item) => item.slug === slug) ?? null
  }

  async isValidSlug(slug: string): Promise<boolean> {
    const product = await this.getProductBySlug(slug)
    return product !== null
  }
}
