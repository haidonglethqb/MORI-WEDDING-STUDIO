import { describe, expect, it } from 'vitest'
import { BespokeEstimator } from './bespoke-estimator.js'
import type { ConversationWeddingBrief } from './assistant-types.js'

describe('BespokeEstimator', () => {
  const estimator = new BespokeEstimator()

  const sampleBrief: ConversationWeddingBrief = {
    coupleNames: 'Huy & Trang',
    weddingDate: '15/12/2026',
    season: 'WINTER',
    venueCategory: 'OUTDOOR_GARDEN',
    location: 'Đà Lạt',
    aestheticIdentity: 'FLORAL_BOTANICAL',
    targetShape: 'BIFOLD',
    guestCount: 120,
    estimatedSuites: 80,
    budgetRangeVnd: null,
    preferredFinishes: ['HOT_FOIL_160C', 'DECKLE_EDGE'],
    shortlistedSlugs: [],
    lastDiscussedSlug: null,
  }

  it('calculates BigInt price accurately for bifold with foil and deckle edge', () => {
    // 80 suites:
    // Base bifold: 80 * 35.000 = 2.800.000 ₫
    // Foil (5.000) + Deckle (5.000) = 10.000 * 80 = 800.000 ₫
    // Grand total: 3.600.000 ₫
    const budget = estimator.calculateBudget(sampleBrief)
    expect(budget).not.toBeNull()
    expect(budget?.quantity).toBe(80)
    expect(budget?.shape).toBe('BIFOLD')
    expect(budget?.baseAmountVnd).toBe('2.800.000 ₫')
    expect(budget?.finishesAmountVnd).toBe('800.000 ₫')
    expect(budget?.totalAmountVnd).toBe('3.600.000 ₫')
    expect(budget?.giftComplimentary).toContain('1.200.000 ₫')
  })

  it('calculates flat cards with single finish', () => {
    const flatBrief: ConversationWeddingBrief = {
      ...sampleBrief,
      targetShape: 'FLAT',
      estimatedSuites: 50,
      preferredFinishes: ['WAX_SEAL'],
    }
    // 50 * 25.000 = 1.250.000 ₫
    // 50 * 6.000 = 300.000 ₫
    // Total = 1.550.000 ₫
    const budget = estimator.calculateBudget(flatBrief)
    expect(budget?.baseAmountVnd).toBe('1.250.000 ₫')
    expect(budget?.finishesAmountVnd).toBe('300.000 ₫')
    expect(budget?.totalAmountVnd).toBe('1.550.000 ₫')
  })

  it('returns null if no guest count or estimated suites provided', () => {
    const emptyBrief: ConversationWeddingBrief = {
      ...sampleBrief,
      guestCount: null,
      estimatedSuites: null,
    }
    const budget = estimator.calculateBudget(emptyBrief)
    expect(budget).toBeNull()
  })
})
