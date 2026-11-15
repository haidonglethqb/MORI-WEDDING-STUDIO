import { describe, expect, it } from 'vitest'
import { CatalogueProductSchema } from '@mori/contracts'
import { CATALOGUE_PRODUCTS } from './catalogue-data.js'
import { getFixtureCatalogue } from './catalogue-fixtures.js'

const BANNED_PAYMENT_PATTERN = /thanh toán|đặt cọc|chuyển khoản|deposit|\bpay\b|\bpaid\b/i

describe('CATALOGUE_PRODUCTS & getFixtureCatalogue', () => {
  it('contains 50 real paper products and 5 digital products with unique slugs', () => {
    const paper = CATALOGUE_PRODUCTS.filter((p) => p.type === 'PAPER')
    const digital = CATALOGUE_PRODUCTS.filter((p) => p.type === 'DIGITAL')
    const slugs = new Set(CATALOGUE_PRODUCTS.map((p) => p.slug))

    expect(CATALOGUE_PRODUCTS).toHaveLength(55)
    expect(paper).toHaveLength(50)
    expect(digital).toHaveLength(5)
    expect(slugs.size).toBe(55)
  })

  it('enforces exact imageUrl paths, VND BigInt prices, styleTags, and DIGITAL 399k-599k pricing', () => {
    const expectedFolder: Record<string, string> = {
      editorial: 'editorial',
      floral: 'floral',
      traditional: 'heritage',
      minimalist: 'minimalist',
      typography: 'modern-calligraphy',
    }
    const expectedPaperPrice: Record<string, Record<string, bigint>> = {
      editorial: { FLAT: 13_000n, BIFOLD: 15_000n },
      floral: { FLAT: 9_000n, BIFOLD: 11_000n },
      traditional: { FLAT: 6_000n, BIFOLD: 8_000n },
      minimalist: { FLAT: 6_000n, BIFOLD: 8_000n },
      typography: { FLAT: 9_000n, BIFOLD: 11_000n },
    }
    const expectedDigital: Record<string, { price: bigint; imageUrl: string }> = {
      'minimalist-digital-01': { price: 399_000n, imageUrl: '/images/products/minimalist/minimalist-flat-01.jpg' },
      'typography-digital-01': { price: 449_000n, imageUrl: '/images/products/modern-calligraphy/typography-flat-01.jpg' },
      'floral-digital-01': { price: 499_000n, imageUrl: '/images/products/floral/floral-flat-01.jpg' },
      'traditional-digital-01': { price: 549_000n, imageUrl: '/images/products/heritage/traditional-flat-01.jpg' },
      'editorial-digital-01': { price: 599_000n, imageUrl: '/images/products/editorial/editorial-flat-01.jpg' },
    }

    for (const item of CATALOGUE_PRODUCTS) {
      expect(BANNED_PAYMENT_PATTERN.test(item.name)).toBe(false)
      expect(BANNED_PAYMENT_PATTERN.test(item.description)).toBe(false)
      expect(item.styleTags).not.toContain('modern')
      expect(item.shape).toBeDefined()

      const prefix = item.slug.split('-')[0] ?? ''
      if (item.type === 'PAPER') {
        expect(item.imageUrl).toBe(`/images/products/${expectedFolder[prefix]}/${item.slug}.jpg`)
        expect(item.unitAmountVnd).toBe(expectedPaperPrice[prefix]?.[item.shape])
      } else {
        const expected = expectedDigital[item.slug]
        expect(item.shape).toBe('FLAT')
        expect(item.imageUrl).toBe(expected?.imageUrl)
        expect(item.unitAmountVnd).toBe(expected?.price)
      }
    }
  })

  it('filters by type, shape, and style and provides AVAILABLE FLAT variants for DIGITAL items', () => {
    const all = getFixtureCatalogue({})
    expect(all).toHaveLength(55)
    for (const item of all) {
      expect(item.isFixture).toBe(false)
      expect(item.variants).toHaveLength(1)
      expect(item.variants[0]?.availability).toBe('AVAILABLE')
      expect(() => CatalogueProductSchema.parse(item)).not.toThrow()
    }

    const paperOnly = getFixtureCatalogue({ type: 'PAPER' })
    expect(paperOnly).toHaveLength(50)

    const digitalOnly = getFixtureCatalogue({ type: 'DIGITAL' })
    expect(digitalOnly).toHaveLength(5)
    expect(digitalOnly.every((p) => p.variants[0]?.shape === 'FLAT')).toBe(true)
    expect(digitalOnly.map((p) => p.variants[0]?.unitAmountVnd)).toEqual([
      '399000',
      '449000',
      '499000',
      '549000',
      '599000',
    ])

    const calligraphyBifold = getFixtureCatalogue({ style: 'calligraphy', shape: 'BIFOLD' })
    expect(calligraphyBifold).toHaveLength(5)
    expect(calligraphyBifold.every((p) => p.imageUrl?.startsWith('/images/products/modern-calligraphy/'))).toBe(true)
  })
})
