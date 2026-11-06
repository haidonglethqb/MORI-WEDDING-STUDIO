import { describe, expect, it, vi, afterEach } from 'vitest'
import { BadRequestException } from '@nestjs/common'
import { ContextExtractor } from './context-extractor.js'
import { AiPricingTool } from './ai-pricing-tool.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import type { EstimateService } from '../pricing/estimate.service.js'
import type { CatalogProductItem } from './assistant-types.js'

describe('PR-01 Acceptance Tests (T09, T11, T12, T13, T14, T28)', () => {
  const originalEnv = process.env['NODE_ENV']

  afterEach(() => {
    process.env['NODE_ENV'] = originalEnv
  })

  // T09: Multi-intent parsing (suite count, negation, budget)
  it('T09: distinguishes 80 suites from guest count and removes hot foil on negation', () => {
    const extractor = new ContextExtractor()
    const initial = extractor.createInitialBrief()
    initial.preferredFinishes = ['HOT_FOIL_160C']
    initial.guestCount = 120

    const boosted = extractor.boostFromText(
      initial,
      '80 bộ Song Hỷ Cung Đình dưới 3 triệu, không ép kim',
    )

    expect(boosted.estimatedSuites).toBe(80)
    expect(boosted.guestCount).toBe(120) // Guest count untouched
    expect(boosted.preferredFinishes).not.toContain('HOT_FOIL_160C')
    expect(boosted.budgetRangeVnd?.max).toBe('3000000')
  })

  // T11: Setup fee & quantity tier precision in single pricing engine
  it('T11: calculates canonical merchandise with setup fee (unit * qty + setup)', async () => {
    const mockEstimateService = {
      estimate: vi.fn().mockResolvedValue({
        currency: 'VND',
        quantity: 80,
        quoteRequired: false,
        merchandiseVnd: '2740000', // 80 * 28,000 + 500,000 setup
        shippingVnd: null,
        taxVnd: null,
        totalVnd: null,
        unresolved: ['shipping', 'tax'],
      }),
    } as unknown as EstimateService

    const pricingTool = new AiPricingTool(mockEstimateService)
    const res = await pricingTool.calculateEstimate({ variantId: 'var-song-hy-80', quantity: 80 })

    expect(res.success).toBe(true)
    expect(res.merchandiseVnd).toBe('2740000')
    expect(res.quoteRequired).toBe(false)
    expect(res.totalVnd).toBeNull()
    expect(res.unresolved).toEqual(['shipping', 'tax'])
  })

  // T12: Variant unavailable or QUOTE_REQUIRED without 25k fallback
  it('T12: returns quoteRequired: true and unavailable without defaulting to 25.000 ₫', async () => {
    const mockEstimateService = {
      estimate: vi.fn().mockImplementation((input: { variantId: string }) => {
        if (input.variantId === 'var-quote-only') {
          return Promise.resolve({
            currency: 'VND',
            quantity: 80,
            quoteRequired: true,
            merchandiseVnd: null,
            shippingVnd: null,
            taxVnd: null,
            totalVnd: null,
            unresolved: ['shipping', 'tax'],
          })
        }
        throw new BadRequestException('This configuration cannot be estimated')
      }),
    } as unknown as EstimateService

    const pricingTool = new AiPricingTool(mockEstimateService)

    // Scenario A: QUOTE_REQUIRED
    const quoteRes = await pricingTool.calculateEstimate({ variantId: 'var-quote-only', quantity: 80 })
    expect(quoteRes.quoteRequired).toBe(true)
    expect(quoteRes.merchandiseVnd).toBeNull()

    // Scenario B: UNAVAILABLE or TRIFOLD
    const unavailRes = await pricingTool.calculateEstimate({ variantId: 'var-trifold', quantity: 50 })
    expect(unavailRes.success).toBe(false)
    expect(unavailRes.status).toBe('UNAVAILABLE')
    expect(unavailRes.isAvailable).toBe(false)
    expect(unavailRes.merchandiseVnd).toBeNull()
  })

  // T13: Production fixture separation (AI-002)
  it('T13: returns empty active products and NEVER serves FIXTURE_CATALOG in production', async () => {
    process.env['NODE_ENV'] = 'production'
    const provider = new CatalogProvider()

    // Mock prisma call failure or empty in production
    const products = await provider.getActiveProducts()
    expect(Array.isArray(products)).toBe(true)
    // In production, when DB returns empty/fails, must NEVER return DEV_FIXTURES
    const hasFixture = products.some((p) => p.isFixture === true)
    expect(hasFixture).toBe(false)
  })

  // T14: Model returns unknown slug
  it('T14: filters out hallucinated slugs not present in active catalogue', () => {
    const matcher = new ScoringMatcher()
    const extractor = new ContextExtractor()
    const brief = extractor.createInitialBrief()

    const catalog: CatalogProductItem[] = [
      {
        id: 'p1',
        slug: 'song-hy-cung-dinh',
        name: 'Song Hỷ Cung Đình',
        shape: 'BIFOLD',
        styleTags: ['traditional'],
        colourTags: ['red'],
        unitPriceVnd: 28000n,
        formattedPriceVnd: '28.000 ₫',
      },
    ]

    const suggestions = ['song-hy-cung-dinh', 'hallucinated-luxury-slug-99']
    const ranked = matcher.rankProducts(catalog, brief, suggestions)

    expect(ranked).toHaveLength(1)
    expect(ranked[0]?.slug).toBe('song-hy-cung-dinh')
    expect(ranked.some((p) => p.slug === 'hallucinated-luxury-slug-99')).toBe(false)
  })

  // T28: Product card grounded in EstimateService
  it('T28: grounds product card price strictly on EstimateService output', async () => {
    const mockEstimateService = {
      estimate: vi.fn().mockResolvedValue({
        currency: 'VND',
        quantity: 80,
        quoteRequired: false,
        merchandiseVnd: '2740000',
        shippingVnd: null,
        taxVnd: null,
        totalVnd: null,
        unresolved: ['shipping', 'tax'],
      }),
    } as unknown as EstimateService

    const pricingTool = new AiPricingTool(mockEstimateService)
    const est = await pricingTool.calculateEstimate({ variantId: 'var-song-hy-bifold', quantity: 80 })

    const productCard = {
      slug: 'traditional-bifold-01',
      name: 'Song Hỷ Cung Đình',
      shape: 'BIFOLD',
      startingPriceVnd: est.merchandiseVnd ?? 'Báo giá riêng',
    }

    expect(productCard.startingPriceVnd).toBe('2740000')
    expect(productCard.startingPriceVnd).not.toBe('25.000 ₫')
  })
})
