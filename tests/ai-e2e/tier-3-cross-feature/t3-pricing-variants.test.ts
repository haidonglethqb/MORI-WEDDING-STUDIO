/**
 * Tier 3: Cross-Feature Combination - Pricing Engine & Variant Availability
 * Verifies that availability states correctly branch between calculation, quote-required, and error.
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 3: Pricing Engine & Variant Availability Combination', () => {
  it('combines quantity tier matching and setup fee for available variant', () => {
    // 80 units of Song Hy Bifold -> Tier [50..99], 28k unit, 500k setup
    const est = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 80,
    })
    expect(est.quoteRequired).toBe(false)
    expect(est.merchandiseVnd).toBe('2740000')
    expect(est.unresolved).toEqual(['shipping', 'tax'])
  })

  it('routes quote-required variant to quoteRequired: true regardless of quantity input', () => {
    const est50 = computeOracleEstimate({
      variantId: 'var-duyen-khoi-quote',
      quantity: 50,
    })
    expect(est50.quoteRequired).toBe(true)
    expect(est50.merchandiseVnd).toBeNull()

    const est200 = computeOracleEstimate({
      variantId: 'var-duyen-khoi-quote',
      quantity: 200,
    })
    expect(est200.quoteRequired).toBe(true)
    expect(est200.merchandiseVnd).toBeNull()
  })

  it('rejects unavailable or trifold variant with BadRequestException even when quantity is valid', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-komorebi-trifold',
        quantity: 100,
      }),
    ).toThrow(/BadRequestException.*cannot be estimated/)
  })
})
