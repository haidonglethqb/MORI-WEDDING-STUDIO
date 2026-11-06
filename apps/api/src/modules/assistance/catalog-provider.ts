import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CatalogProductItem } from './assistant-types.js'

const DEV_FIXTURES: CatalogProductItem[] = [
  { id: 'p1', slug: 'traditional-bifold-01', name: 'Song Hỷ Cung Đình', shape: 'BIFOLD', styleTags: ['traditional'], colourTags: ['red'], unitPriceVnd: 38000n, formattedPriceVnd: '38.000 ₫', isFixture: true },
  { id: 'p2', slug: 'traditional-flat-01', name: 'Duyên Khởi Trăm Năm', shape: 'FLAT', styleTags: ['traditional'], colourTags: ['gold'], unitPriceVnd: 28000n, formattedPriceVnd: '28.000 ₫', isFixture: true },
  { id: 'p3', slug: 'floral-bifold-01', name: 'Provence Magnolia', shape: 'BIFOLD', styleTags: ['floral'], colourTags: ['sage'], unitPriceVnd: 35000n, formattedPriceVnd: '35.000 ₫', isFixture: true },
  { id: 'p4', slug: 'editorial-bifold-01', name: "L'Amour Vogue No. 1", shape: 'BIFOLD', styleTags: ['editorial'], colourTags: ['champagne'], unitPriceVnd: 42000n, formattedPriceVnd: '42.000 ₫', isFixture: true },
  { id: 'p5', slug: 'minimalist-flat-01', name: 'Kyoto Zen Stone', shape: 'FLAT', styleTags: ['minimalist'], colourTags: ['linen'], unitPriceVnd: 25000n, formattedPriceVnd: '25.000 ₫', isFixture: true },
]

@Injectable()
export class CatalogProvider {
  private isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production'
  }

  async getActiveProducts(): Promise<CatalogProductItem[]> {
    try {
      const products = await getPrismaClient().product.findMany({
        where: { state: 'ACTIVE' },
        include: {
          variants: {
            where: { shape: { not: 'TRIFOLD' }, availability: { not: 'UNAVAILABLE' } },
            include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
          },
        },
      })

      if (!products.length) {
        return this.isProduction() ? [] : DEV_FIXTURES
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
          isFixture: false,
        }
      })
    } catch {
      return this.isProduction() ? [] : DEV_FIXTURES
    }
  }
}
