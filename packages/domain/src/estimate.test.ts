import { describe, expect, it } from 'vitest'
import { estimatePrice, type PriceTier } from './estimate.js'

const tiers: PriceTier[] = [
  { quantityMin: 1, quantityMax: 10, unitAmountVnd: 50_000n, setupAmountVnd: 100_000n },
  { quantityMin: 11, quantityMax: 100, unitAmountVnd: 40_000n, setupAmountVnd: 100_000n },
]

describe('estimatePrice', () => {
  it('uses the tier on each side of the boundary', () => {
    const low = estimatePrice({ quantity: 10, tiers, shippingVnd: 0n, taxVnd: 0n })
    const high = estimatePrice({ quantity: 11, tiers, shippingVnd: 0n, taxVnd: 0n })
    expect(low.merchandiseVnd).toBe('600000')
    expect(high.merchandiseVnd).toBe('540000')
    expect(low.totalVnd).toBe('600000')
  })

  it('leaves the total null when shipping or tax is unknown', () => {
    const estimate = estimatePrice({ quantity: 10, tiers, shippingVnd: null, taxVnd: 20_000n })
    expect(estimate.shippingVnd).toBeNull()
    expect(estimate.totalVnd).toBeNull()
    expect(estimate.unresolved).toEqual(['shipping'])
    expect(estimate.merchandiseVnd).not.toBe('0')
  })

  it('rejects quantities outside the allowed range', () => {
    expect(() => estimatePrice({ quantity: 0, tiers, shippingVnd: 0n, taxVnd: 0n })).toThrow(/1 to 10000/)
    expect(() => estimatePrice({ quantity: 1.5, tiers, shippingVnd: 0n, taxVnd: 0n })).toThrow(/1 to 10000/)
    expect(() => estimatePrice({ quantity: 10_001, tiers, shippingVnd: 0n, taxVnd: 0n })).toThrow(
      /1 to 10000/,
    )
  })
})
