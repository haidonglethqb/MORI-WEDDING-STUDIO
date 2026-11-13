import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CatalogProductItem } from './assistant-types.js'

const DEV_FIXTURES: CatalogProductItem[] = [
  { id: 'p1', slug: 'traditional-bifold-01', name: 'Song Hỷ Cung Đình', shape: 'BIFOLD', styleTags: ['traditional'], colourTags: ['crimson', 'gold'], unitPriceVnd: 8000n, formattedPriceVnd: '8.000 ₫', imageUrl: '/images/products/heritage/traditional-bifold-01.jpg', isFixture: true },
  { id: 'p2', slug: 'traditional-flat-01', name: 'Duyên Khởi Trăm Năm', shape: 'FLAT', styleTags: ['traditional'], colourTags: ['crimson', 'gold'], unitPriceVnd: 6000n, formattedPriceVnd: '6.000 ₫', imageUrl: '/images/products/heritage/traditional-flat-01.jpg', isFixture: true },
  { id: 'p3', slug: 'floral-bifold-01', name: 'Provence Magnolia', shape: 'BIFOLD', styleTags: ['floral'], colourTags: ['sage', 'ivory'], unitPriceVnd: 11000n, formattedPriceVnd: '11.000 ₫', imageUrl: '/images/products/floral/floral-bifold-01.jpg', isFixture: true },
  { id: 'p4', slug: 'floral-flat-01', name: 'Wildflower Meadows', shape: 'FLAT', styleTags: ['floral'], colourTags: ['sage', 'ivory'], unitPriceVnd: 9000n, formattedPriceVnd: '9.000 ₫', imageUrl: '/images/products/floral/floral-flat-01.jpg', isFixture: true },
  { id: 'p5', slug: 'editorial-bifold-01', name: "L'Amour Vogue No. 1", shape: 'BIFOLD', styleTags: ['editorial'], colourTags: ['champagne', 'ivory'], unitPriceVnd: 15000n, formattedPriceVnd: '15.000 ₫', imageUrl: '/images/products/editorial/editorial-bifold-01.jpg', isFixture: true },
  { id: 'p6', slug: 'editorial-flat-01', name: 'Haute Couture Élysée', shape: 'FLAT', styleTags: ['editorial'], colourTags: ['ivory', 'obsidian'], unitPriceVnd: 13000n, formattedPriceVnd: '13.000 ₫', imageUrl: '/images/products/editorial/editorial-flat-01.jpg', isFixture: true },
  { id: 'p7', slug: 'minimalist-bifold-01', name: 'Komorebi Wabi-Sabi', shape: 'BIFOLD', styleTags: ['minimalist'], colourTags: ['olive', 'ivory'], unitPriceVnd: 8000n, formattedPriceVnd: '8.000 ₫', imageUrl: '/images/products/minimalist/minimalist-bifold-01.jpg', isFixture: true },
  { id: 'p8', slug: 'minimalist-flat-01', name: 'Kyoto Zen Stone', shape: 'FLAT', styleTags: ['minimalist'], colourTags: ['linen', 'stone'], unitPriceVnd: 6000n, formattedPriceVnd: '6.000 ₫', imageUrl: '/images/products/minimalist/minimalist-flat-01.jpg', isFixture: true },
  { id: 'p9', slug: 'typography-bifold-01', name: 'Florence Monogram', shape: 'BIFOLD', styleTags: ['typography', 'calligraphy'], colourTags: ['ivory', 'olive'], unitPriceVnd: 11000n, formattedPriceVnd: '11.000 ₫', imageUrl: '/images/products/modern-calligraphy/typography-bifold-01.jpg', isFixture: true },
  { id: 'p10', slug: 'typography-flat-01', name: 'Artisan Letterpress', shape: 'FLAT', styleTags: ['typography', 'calligraphy'], colourTags: ['ivory', 'ink'], unitPriceVnd: 9000n, formattedPriceVnd: '9.000 ₫', imageUrl: '/images/products/modern-calligraphy/typography-flat-01.jpg', isFixture: true },
]

@Injectable()
export class CatalogProvider {
  private isProduction(): boolean {
    return process.env['NODE_ENV'] === 'production' || process.env['APP_ENV'] === 'production'
  }

  async getActiveProducts(): Promise<CatalogProductItem[]> {
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
          imageUrl: p.imageUrl ?? null,
          isFixture: p.isFixture ?? false,
        }
      })
    } catch {
      return this.isProduction() ? [] : DEV_FIXTURES
    }
  }
}
