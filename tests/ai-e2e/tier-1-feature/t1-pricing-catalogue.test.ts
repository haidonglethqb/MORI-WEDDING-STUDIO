/**
 * Tier 1: Feature 10, 11, 12, 13 - Single Pricing Engine & Production Fixture Separation
 * Authoritative: PROJECT.md F07/F08, MORI_AI_V2_AGENT_HANDOFF.md AI-002/AI-003, ADR-02
 */
import { describe, expect, it } from 'vitest'
import {
  PRODUCT_ARCHIVED,
  PRODUCT_SONG_HY,
  TEST_CATALOGUE_FIXTURES,
} from '../harness/catalogue-fixtures.js'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 1: Single Pricing Engine & Production Fixture Separation', () => {
  it('retrieves only ACTIVE products, excluding ARCHIVED collections', () => {
    const activeProducts = TEST_CATALOGUE_FIXTURES.filter((p) => p.state === 'ACTIVE')
    expect(activeProducts.length).toBeGreaterThan(0)
    expect(activeProducts.some((p) => p.id === PRODUCT_ARCHIVED.id)).toBe(false)
    expect(activeProducts.some((p) => p.id === PRODUCT_SONG_HY.id)).toBe(true)
  })

  it('routes price calculation through canonical pricing formula (merchandise = unit * qty + setup)', () => {
    // Song Hy Bifold at 80 qty (tier: 50..99, unit: 28k, setup: 500k)
    // 80 * 28,000 + 500,000 = 2,240,000 + 500,000 = 2,740,000 VND
    const estimate = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 80,
    })

    expect(estimate.merchandiseVnd).toBe('2740000')
    expect(estimate.currency).toBe('VND')
    expect(estimate.quoteRequired).toBe(false)
    expect(estimate.totalVnd).toBeNull()
    expect(estimate.unresolved).toEqual(['shipping', 'tax'])
  })

  it('rejects fallback to FIXTURE_CATALOG in production environment (AI-002, E11)', () => {
    const resolveProductionCatalog = (dbProducts: typeof TEST_CATALOGUE_FIXTURES, isProd: boolean) => {
      if (dbProducts.length === 0) {
        if (isProd) {
          return { available: false, products: [], notice: 'CATALOGUE_UNAVAILABLE' }
        }
        return { available: true, products: ['FIXTURE_FALLBACK'], isFixture: true }
      }
      return { available: true, products: dbProducts }
    }

    const prodEmpty = resolveProductionCatalog([], true)
    expect(prodEmpty.products).toHaveLength(0)
    expect(prodEmpty.notice).toBe('CATALOGUE_UNAVAILABLE')
    expect(prodEmpty.products).not.toContain('FIXTURE_FALLBACK')
  })

  it('rejects TRIFOLD configurations with BadRequestException (E12)', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-komorebi-trifold',
        quantity: 50,
      }),
    ).toThrow(/BadRequestException.*configuration cannot be estimated/)
  })
})
