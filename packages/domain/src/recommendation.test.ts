import { describe, expect, it } from 'vitest'
import { keepRetrievedIds, rankCatalogue, type CatalogueCandidate, type CataloguePreference } from './recommendation.js'

const preference: CataloguePreference = {
  productType: 'PAPER',
  shape: 'FLAT',
  styles: ['minimalist'],
  colours: ['ivory'],
  quantity: 10,
  budgetVnd: 1_000_000n,
  budgetBasis: 'TOTAL',
}

const candidates: CatalogueCandidate[] = [
  {
    productId: 'match',
    productType: 'PAPER',
    shape: 'FLAT',
    styleTags: ['minimalist'],
    colourTags: ['ivory'],
    available: true,
    merchandiseVnd: 600_000n,
  },
  {
    productId: 'other-style',
    productType: 'PAPER',
    shape: 'FLAT',
    styleTags: ['luxury'],
    colourTags: ['ivory'],
    available: true,
    merchandiseVnd: 600_000n,
  },
  {
    productId: 'tri',
    productType: 'PAPER',
    shape: 'TRIFOLD',
    styleTags: ['minimalist'],
    colourTags: ['ivory'],
    available: true,
    merchandiseVnd: 100_000n,
  },
]

describe('rankCatalogue', () => {
  it('asks instead of guessing an ambiguous budget', () => {
    const ranked = rankCatalogue({ ...preference, budgetBasis: 'UNKNOWN' }, candidates)
    expect(ranked.results).toEqual([])
    expect(ranked.clarification).toMatch(/total or the amount per card/)
  })

  it('ranks the style match first and drops tri-fold', () => {
    const ranked = rankCatalogue(preference, candidates)
    expect(ranked.results.map((item) => item.productId)).toEqual(['match', 'other-style'])
    expect(ranked.results[0]?.merchandiseVnd).toBe(600_000n)
  })
})

describe('keepRetrievedIds', () => {
  it('drops product ids the catalogue did not return', () => {
    expect(keepRetrievedIds(['match'], ['match', 'invented'])).toEqual(['match'])
  })
})
