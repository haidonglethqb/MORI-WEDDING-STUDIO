import { describe, expect, it } from 'vitest'
import { BespokeEstimator } from './bespoke-estimator.js'
import type { ConversationWeddingBrief } from './assistant-types.js'

describe('BespokeEstimator (Deprecated in PR-01)', () => {
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

  it('deprecates ad-hoc estimates and returns null (AI-003)', () => {
    const budget = estimator.calculateBudget(sampleBrief)
    expect(budget).toBeNull()
  })

  it('eliminates fabricated 1.200.000 ₫ promotional gift (AI-016)', () => {
    const budget = estimator.calculateBudget(sampleBrief)
    expect(budget?.giftComplimentary).toBeUndefined()
  })
})
