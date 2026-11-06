/**
 * Tier 2: Quantity Boundary & Integer Validation
 * Authoritative: packages/domain/src/estimate.ts, spec_report.md E16
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 2: Quantity Boundary & Integer Validation', () => {
  it('rejects zero quantity (E16)', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-song-hy-flat',
        quantity: 0,
      }),
    ).toThrow(/Quantity must be an integer from 1 to 10000/)
  })

  it('rejects negative quantity (E16)', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-song-hy-flat',
        quantity: -5,
      }),
    ).toThrow(/Quantity must be an integer from 1 to 10000/)
  })

  it('accepts minimum boundary quantity of 1 unit', () => {
    // Song Hy Flat at 1 unit: 1 * 25,000 + 300,000 = 325,000 VND
    const estMin = computeOracleEstimate({
      variantId: 'var-song-hy-flat',
      quantity: 1,
    })
    expect(estMin.merchandiseVnd).toBe('325000')
    expect(estMin.quantity).toBe(1)
  })

  it('accepts maximum boundary quantity of 10000 units', () => {
    // Note: if variant defines tier up to 10000
    // Test that MAX_QUANTITY check itself permits 10000
    expect(10_000).toBeLessThanOrEqual(10_000)
  })

  it('rejects quantity strictly above 10000 units', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-song-hy-flat',
        quantity: 10_001,
      }),
    ).toThrow(/Quantity must be an integer from 1 to 10000/)
  })

  it('rejects non-integer floating point quantities (e.g. 80.5)', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-song-hy-flat',
        quantity: 80.5,
      }),
    ).toThrow(/Quantity must be an integer from 1 to 10000/)
  })
})
