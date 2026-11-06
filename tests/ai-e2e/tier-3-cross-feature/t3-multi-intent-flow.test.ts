/**
 * Tier 3: Cross-Feature Combination - Multi-Intent State & Pricing Evaluation
 * Simulates end-to-end processing of compound prompt "80 bộ X dưới 3 triệu, không ép kim".
 */
import { describe, expect, it } from 'vitest'
import {
  applyFactPatches,
  createInitialTestBrief,
  type TestFactPatch,
} from '../harness/conversation-memory-harness.js'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 3: Multi-Intent State & Pricing Evaluation Combination', () => {
  it('processes state patch, style removal, and budget verification in a single atomic turn', () => {
    // 1. Initial State: Couple has 120 guests and previously selected hot foil
    const initialBrief = createInitialTestBrief()
    initialBrief.guestCount = 120
    initialBrief.preferredFinishes = ['HOT_FOIL_160C']

    // 2. Incoming compound turn: "80 bộ Song Hỷ dưới 3 triệu, không ép kim"
    const patches: TestFactPatch[] = [
      { op: 'SET', field: 'suiteQuantity', value: 80 },
      { op: 'REMOVE_FROM_SET', field: 'preferredFinishes', value: 'HOT_FOIL_160C' },
      { op: 'SET', field: 'budgetVnd', value: '3000000' },
      { op: 'SET', field: 'budgetBasis', value: 'TOTAL' },
    ]

    const updatedBrief = applyFactPatches(initialBrief, patches)

    // Verify Brief Assertions
    expect(updatedBrief.guestCount).toBe(120) // Guests untouched
    expect(updatedBrief.suiteQuantity).toBe(80) // Suites confirmed 80
    expect(updatedBrief.preferredFinishes).not.toContain('HOT_FOIL_160C')
    expect(updatedBrief.budgetVnd).toBe('3000000')

    // 3. Pricing Execution for Song Hy Bifold at 80 units
    const estimate = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: updatedBrief.suiteQuantity,
    })

    // Assert Price Math: 80 * 28k + 500k = 2.740.000 VND
    expect(estimate.merchandiseVnd).toBe('2740000')

    // Budget Comparison Invariant (BigInt comparison)
    const budgetBig = BigInt(updatedBrief.budgetVnd)
    const actualBig = BigInt(estimate.merchandiseVnd)
    expect(actualBig <= budgetBig).toBe(true)
  })
})
