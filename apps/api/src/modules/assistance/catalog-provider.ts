import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { CatalogProductItem } from './assistant-types.js'

const FIXTURE_CATALOG: CatalogProductItem[] = [
  {
    id: 'prod-01',
    slug: 'traditional-bifold-01',
    name: 'Song Hỷ Cung Đình',
    shape: 'BIFOLD',
    styleTags: ['traditional', 'heritage', 'indochine'],
    colourTags: ['red', 'gold', 'crimson'],
    unitPriceVnd: 38000n,
    formattedPriceVnd: '38.000 ₫',
  },
  {
    id: 'prod-02',
    slug: 'traditional-flat-01',
    name: 'Duyên Khởi Trăm Năm',
    shape: 'FLAT',
    styleTags: ['traditional', 'heritage', 'indochine'],
    colourTags: ['red', 'gold'],
    unitPriceVnd: 28000n,
    formattedPriceVnd: '28.000 ₫',
  },
  {
    id: 'prod-03',
    slug: 'floral-bifold-01',
    name: 'Provence Magnolia',
    shape: 'BIFOLD',
    styleTags: ['floral', 'botanical', 'garden', 'nature'],
    colourTags: ['sage', 'ivory', 'forest'],
    unitPriceVnd: 35000n,
    formattedPriceVnd: '35.000 ₫',
  },
  {
    id: 'prod-04',
    slug: 'floral-flat-01',
    name: 'Wildflower Meadows',
    shape: 'FLAT',
    styleTags: ['floral', 'botanical', 'minimalist'],
    colourTags: ['ivory', 'green'],
    unitPriceVnd: 25000n,
    formattedPriceVnd: '25.000 ₫',
  },
  {
    id: 'prod-05',
    slug: 'editorial-bifold-01',
    name: "L'Amour Vogue No. 1",
    shape: 'BIFOLD',
    styleTags: ['editorial', 'vogue', 'modern', 'paris'],
    colourTags: ['monochrome', 'champagne', 'black'],
    unitPriceVnd: 42000n,
    formattedPriceVnd: '42.000 ₫',
  },
  {
    id: 'prod-06',
    slug: 'editorial-flat-01',
    name: 'Haute Couture Élysée',
    shape: 'FLAT',
    styleTags: ['editorial', 'vogue', 'modern'],
    colourTags: ['ivory', 'champagne'],
    unitPriceVnd: 32000n,
    formattedPriceVnd: '32.000 ₫',
  },
  {
    id: 'prod-07',
    slug: 'minimalist-bifold-01',
    name: 'Komorebi Wabi-Sabi',
    shape: 'BIFOLD',
    styleTags: ['minimalist', 'japandi', 'wabi-sabi'],
    colourTags: ['ivory', 'sand'],
    unitPriceVnd: 35000n,
    formattedPriceVnd: '35.000 ₫',
  },
  {
    id: 'prod-08',
    slug: 'minimalist-flat-01',
    name: 'Kyoto Zen Stone',
    shape: 'FLAT',
    styleTags: ['minimalist', 'japandi', 'wabi-sabi'],
    colourTags: ['warm-ivory', 'linen'],
    unitPriceVnd: 25000n,
    formattedPriceVnd: '25.000 ₫',
  },
  {
    id: 'prod-09',
    slug: 'modern-flat-01',
    name: 'Celestial Halo',
    shape: 'FLAT',
    styleTags: ['modern', 'celestial', 'minimalist'],
    colourTags: ['ivory', 'gold'],
    unitPriceVnd: 26000n,
    formattedPriceVnd: '26.000 ₫',
  },
  {
    id: 'prod-10',
    slug: 'typography-bifold-01',
    name: 'Florence Monogram',
    shape: 'BIFOLD',
    styleTags: ['calligraphy', 'typography', 'script'],
    colourTags: ['ivory', 'charcoal'],
    unitPriceVnd: 36000n,
    formattedPriceVnd: '36.000 ₫',
  },
]

@Injectable()
export class CatalogProvider {
  async getActiveProducts(): Promise<CatalogProductItem[]> {
    try {
      const products = await getPrismaClient().product.findMany({
        where: { state: 'ACTIVE' },
        include: {
          variants: {
            include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
          },
        },
      })

      if (!products.length) return FIXTURE_CATALOG

      return products.map((p) => {
        const v = p.variants[0]
        const rawAmount = v?.priceRules[0]?.unitAmountVnd ?? 25000n
        const unitPriceVnd = typeof rawAmount === 'bigint' ? rawAmount : BigInt(rawAmount)
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          shape: v?.shape ?? 'FLAT',
          styleTags: p.styleTags ?? [],
          colourTags: p.colourTags ?? [],
          unitPriceVnd,
          formattedPriceVnd: `${Number(unitPriceVnd).toLocaleString('vi-VN')} ₫`,
        }
      })
    } catch {
      return FIXTURE_CATALOG
    }
  }
}
