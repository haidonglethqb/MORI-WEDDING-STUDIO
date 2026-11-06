import { describe, expect, it } from 'vitest'
import { ScoringMatcher } from './scoring-matcher.js'
import type { CatalogProductItem, ConversationWeddingBrief } from './assistant-types.js'

describe('ScoringMatcher', () => {
  const matcher = new ScoringMatcher()

  const dummyCatalog: CatalogProductItem[] = [
    {
      id: 'p1',
      slug: 'floral-bifold-01',
      name: 'Botanical Herbarium',
      shape: 'BIFOLD',
      styleTags: ['floral', 'botanical', 'garden'],
      colourTags: ['sage', 'ivory'],
      unitPriceVnd: 35000n,
      formattedPriceVnd: '35.000 ₫',
    },
    {
      id: 'p2',
      slug: 'traditional-bifold-01',
      name: 'Song Hỷ Cung Đình',
      shape: 'BIFOLD',
      styleTags: ['traditional', 'heritage', 'indochine'],
      colourTags: ['red', 'gold'],
      unitPriceVnd: 38000n,
      formattedPriceVnd: '38.000 ₫',
    },
    {
      id: 'p3',
      slug: 'minimalist-flat-01',
      name: 'Pure Wabi-Sabi',
      shape: 'FLAT',
      styleTags: ['minimalist', 'japandi', 'wabi-sabi'],
      colourTags: ['ivory', 'sand'],
      unitPriceVnd: 25000n,
      formattedPriceVnd: '25.000 ₫',
    },
  ]

  const baseBrief: ConversationWeddingBrief = {
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
    preferredFinishes: ['DECKLE_EDGE'],
    shortlistedSlugs: [],
    lastDiscussedSlug: null,
  }

  it('ranks floral botanical and garden products highest for outdoor garden brief', () => {
    const results = matcher.rankProducts(dummyCatalog, baseBrief)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.slug).toBe('floral-bifold-01')
  })

  it('ranks traditional products highest for heritage indochine brief', () => {
    const heritageBrief: ConversationWeddingBrief = {
      ...baseBrief,
      aestheticIdentity: 'HERITAGE_INDOCHINE',
      venueCategory: 'HERITAGE_HOME',
    }
    const results = matcher.rankProducts(dummyCatalog, heritageBrief)
    expect(results[0]?.slug).toBe('traditional-bifold-01')
  })

  it('prioritizes suggested slugs when provided and valid', () => {
    const results = matcher.rankProducts(dummyCatalog, baseBrief, ['minimalist-flat-01'])
    expect(results).toHaveLength(1)
    expect(results[0]?.slug).toBe('minimalist-flat-01')
  })
})
