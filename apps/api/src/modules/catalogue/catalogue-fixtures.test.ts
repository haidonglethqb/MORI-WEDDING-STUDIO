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

  it('enforces exact imageUrl paths, VND BigInt prices, styleTags, and INV-13 copy', () => {
    const expectedFolder: Record<string, string> = {
      editorial: 'editorial',
      floral: 'floral',
      traditional: 'heritage',
      minimalist: 'minimalist',
      typography: 'modern-calligraphy',
    }
    const expectedPrice: Record<string, Record<string, bigint>> = {
      editorial: { FLAT: 13_000n, BIFOLD: 15_000n },
      floral: { FLAT: 9_000n, BIFOLD: 11_000n },
      traditional: { FLAT: 6_000n, BIFOLD: 8_000n },
      minimalist: { FLAT: 6_000n, BIFOLD: 8_000n },
      typography: { FLAT: 9_000n, BIFOLD: 11_000n },
    }

    for (const item of CATALOGUE_PRODUCTS) {
      expect(BANNED_PAYMENT_PATTERN.test(item.name)).toBe(false)
      expect(BANNED_PAYMENT_PATTERN.test(item.description)).toBe(false)
      expect(item.styleTags).not.toContain('modern')

      const prefix = item.slug.split('-')[0] ?? ''
      if (item.type === 'PAPER') {
        expect(item.shape).toBeDefined()
        expect(item.imageUrl).toBe(`/images/products/${expectedFolder[prefix]}/${item.slug}.jpg`)
        expect(item.unitAmountVnd).toBe(expectedPrice[prefix]?.[item.shape ?? ''])
      } else {
        expect(item.imageUrl).toBeNull()
        expect(item.unitAmountVnd).toBe(0n)
      }
    }
  })

  it('filters by type, shape, and style and satisfies CatalogueProductSchema with isFixture: false', () => {
    const all = getFixtureCatalogue({})
    expect(all).toHaveLength(55)
    for (const item of all) {
      expect(item.isFixture).toBe(false)
      expect(() => CatalogueProductSchema.parse(item)).not.toThrow()
    }

    const paperOnly = getFixtureCatalogue({ type: 'PAPER' })
    expect(paperOnly).toHaveLength(50)

    const calligraphyBifold = getFixtureCatalogue({ style: 'calligraphy', shape: 'BIFOLD' })
    expect(calligraphyBifold).toHaveLength(5)
    expect(calligraphyBifold.every((p) => p.imageUrl?.startsWith('/images/products/modern-calligraphy/'))).toBe(true)
  })
})
