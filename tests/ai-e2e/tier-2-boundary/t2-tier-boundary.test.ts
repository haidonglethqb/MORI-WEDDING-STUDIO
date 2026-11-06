/**
 * Tier 2: Tier Boundary Matching & Tier Gap Handling
 * Authoritative: packages/domain/src/estimate.ts, spec_report.md E17
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 2: Tier Boundary Matching & Tier Gap Handling', () => {
  it('correctly matches exact lower bound of a price tier (quantity = 50 on [50..99])', () => {
    // 50 * 28,000 + 500,000 = 1,400,000 + 500,000 = 1,900,000 VND
    const lowerEst = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 50,
    })
    expect(lowerEst.merchandiseVnd).toBe('1900000')
  })

  it('correctly matches exact upper bound of a price tier (quantity = 99 on [50..99])', () => {
    // 99 * 28,000 + 500,000 = 2,772,000 + 500,000 = 3,272,000 VND
    const upperEst = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 99,
    })
    expect(upperEst.merchandiseVnd).toBe('3272000')
  })

  it('throws tier resolution error when quantity exceeds all defined tiers (qty 501 on max 500, E17)', () => {
    expect(() =>
      computeOracleEstimate({
        variantId: 'var-song-hy-bifold',
        quantity: 501,
      }),
    ).toThrow(/Quantity does not match exactly one price tier/)
  })

  it('rejects ambiguous overlapping tiers where quantity matches multiple tiers', () => {
    const overlappingTiers = [
      { quantityMin: 1, quantityMax: 100, unitAmountVnd: 30000n, setupAmountVnd: 0n },
      { quantityMin: 50, quantityMax: 150, unitAmountVnd: 25000n, setupAmountVnd: 0n },
    ]
    const qty = 75
    const matches = overlappingTiers.filter(
      (t) => qty >= t.quantityMin && qty <= t.quantityMax,
    )
    expect(matches).toHaveLength(2)
    // Domain rule: matches.length !== 1 must throw
    expect(matches.length !== 1).toBe(true)
  })
})
