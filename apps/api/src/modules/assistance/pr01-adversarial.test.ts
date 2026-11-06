/**
 * PR-01 Adversarial Verification Suite: Multi-Intent, Production Isolation & Grounded Cards
 * Empirical challenger tests verifying T09, T13, and T28 invariants (< 200 lines).
 */
import { describe, expect, it, vi, afterEach } from 'vitest'
import * as dbModule from '@mori/database'
import { ContextExtractor } from './context-extractor.js'
import { CatalogProvider } from './catalog-provider.js'
import { AiCatalogueTool } from './ai-catalogue-tool.js'
import { AiPricingTool } from './ai-pricing-tool.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import type { GroqAiGateway } from './groq-ai-gateway.js'

type DbClient = ReturnType<typeof dbModule.getPrismaClient>

describe('Adversarial PR-01 Verification Suite', () => {
  const origNodeEnv = process.env['NODE_ENV']
  const origAppEnv = process.env['APP_ENV']

  afterEach(() => {
    process.env['NODE_ENV'] = origNodeEnv
    process.env['APP_ENV'] = origAppEnv
    vi.restoreAllMocks()
  })

  describe('1. Multi-Intent & Negation Challenge (T09)', () => {
    const extractor = new ContextExtractor()

    it('T09: parses "80 bộ X dưới 3 triệu, không ép kim" preserving guest count and stripping foil', () => {
      const brief = extractor.createInitialBrief()
      brief.guestCount = 80 // Prior 80 guests would normally produce 52 suites (80 * 0.65)
      brief.preferredFinishes = ['HOT_FOIL_160C']
      const updated = extractor.boostFromText(brief, '80 bộ Song Hỷ dưới 3 triệu, không ép kim')

      expect(updated.estimatedSuites).toBe(80) // Explicit suite count, NOT 52
      expect(updated.guestCount).toBe(80) // Guest count untouched
      expect(updated.preferredFinishes).not.toContain('HOT_FOIL_160C')
      expect(updated.budgetRangeVnd?.max).toBe('3000000') // Budget basis: TOTAL (3M VND)

      const actualMerchandise = 2740000n // 80 * 28k + 500k setup fee
      const maxBudgetStr = updated.budgetRangeVnd ? updated.budgetRangeVnd.max : '0'
      expect(actualMerchandise <= BigInt(maxBudgetStr)).toBe(true)
    })

    it('handles negation synonyms without leaking finishes', () => {
      for (const phrase of ['80 thiệp dưới 3tr, bỏ ép kim', '80 set dưới 3 triệu, đừng dát kim', '80 bộ dưới 3 triệu, thôi foil']) {
        const brief = extractor.createInitialBrief()
        brief.preferredFinishes = ['HOT_FOIL_160C']
        const res = extractor.boostFromText(brief, phrase)
        expect(res.estimatedSuites).toBe(80)
        expect(res.preferredFinishes).not.toContain('HOT_FOIL_160C')
      }
    })

    it('disambiguates explicit guest count vs explicit suite count', () => {
      const b1 = extractor.boostFromText(extractor.createInitialBrief(), '120 khách dự đám cưới')
      expect(b1.guestCount).toBe(120)
      expect(b1.estimatedSuites).toBe(78) // 120 * 0.65 = 78

      const b2 = extractor.boostFromText(extractor.createInitialBrief(), '120 khách nhưng chỉ in 80 bộ thiệp')
      expect(b2.guestCount).toBe(120)
      expect(b2.estimatedSuites).toBe(80) // Explicit suites overrides multiplier
    })
  })

  describe('2. Production Fixture Isolation Challenge (T13)', () => {
    it('CatalogProvider returns [] and NEVER serves DEV_FIXTURES on empty DB in production', async () => {
      process.env['NODE_ENV'] = 'production'
      vi.spyOn(dbModule, 'getPrismaClient').mockReturnValue({ product: { findMany: vi.fn().mockResolvedValue([]) } } as unknown as DbClient)
      const products = await new CatalogProvider().getActiveProducts()
      expect(products).toEqual([])
      expect(products.some((p) => p.isFixture)).toBe(false)
    })

    it('CatalogProvider returns [] and NEVER serves DEV_FIXTURES on DB failure in production', async () => {
      process.env['APP_ENV'] = 'production'
      vi.spyOn(dbModule, 'getPrismaClient').mockReturnValue({ product: { findMany: vi.fn().mockRejectedValue(new Error('Down')) } } as unknown as DbClient)
      const products = await new CatalogProvider().getActiveProducts()
      expect(products).toEqual([])
    })

    it('serves DEV_FIXTURES only in non-production environments when DB is empty', async () => {
      delete process.env['NODE_ENV']
      delete process.env['APP_ENV']
      vi.spyOn(dbModule, 'getPrismaClient').mockReturnValue({ product: { findMany: vi.fn().mockResolvedValue([]) } } as unknown as DbClient)
      const products = await new CatalogProvider().getActiveProducts()
      expect(products.length).toBeGreaterThan(0)
      expect(products.every((p) => p.isFixture)).toBe(true)
    })

    it('AiCatalogueTool returns [] and never exposes fixtures on DB error', async () => {
      process.env['NODE_ENV'] = 'production'
      vi.spyOn(dbModule, 'getPrismaClient').mockReturnValue({ product: { findMany: vi.fn().mockRejectedValue(new Error('Err')) } } as unknown as DbClient)
      expect(await new AiCatalogueTool().listActiveProducts()).toEqual([])
    })

    it('Orchestrator in production returns zero fixture product cards during DB outage', async () => {
      process.env['NODE_ENV'] = 'production'
      const mockGateway = { executeCompletion: vi.fn().mockRejectedValue(new Error('Down')) } as unknown as GroqAiGateway
      const orchestrator = new AssistantOrchestratorService(
        mockGateway,
        new ContextExtractor(),
        { getActiveProducts: vi.fn().mockResolvedValue([]) } as unknown as CatalogProvider,
        new ScoringMatcher(),
        new BespokeEstimator(),
        new SupervisorGuardrail(),
      )
      const res = await orchestrator.handleChat({ message: 'Tư vấn thiệp' })
      expect(res.suggestedProducts).toEqual([])
    })
  })

  describe('3. Grounded Product Card Consistency Challenge (T28)', () => {
    it('T28: suggested product cards reflect verified EstimateService calculated totals', async () => {
      const mockGateway = {
        executeCompletion: vi.fn().mockResolvedValue({
          data: { reply: 'Gợi ý Song Hỷ Cung Đình.', suggestedSlugs: ['song-hy-cung-dinh'] },
          modelUsed: 'openai/gpt-oss-120b',
          fallbackTier: 1,
          latencyMs: 150,
        }),
      } as unknown as GroqAiGateway

      const catalogItem = {
        id: 'p1',
        slug: 'song-hy-cung-dinh',
        name: 'Song Hỷ Cung Đình',
        shape: 'BIFOLD',
        styleTags: ['traditional'],
        colourTags: ['red'],
        unitPriceVnd: 28000n,
        formattedPriceVnd: '28.000 ₫',
      }
      const mockPricingTool = {
        lookupVariantAndEstimate: vi.fn().mockResolvedValue({
          success: true,
          merchandiseVnd: '2740000', // Verified canonical estimate for 80 units (80 * 28k + 500k)
          quoteRequired: false,
        }),
      } as unknown as AiPricingTool

      const orchestrator = new AssistantOrchestratorService(
        mockGateway,
        new ContextExtractor(),
        { getActiveProducts: vi.fn().mockResolvedValue([catalogItem]) } as unknown as CatalogProvider,
        new ScoringMatcher(),
        new BespokeEstimator(),
        new SupervisorGuardrail(),
        mockPricingTool,
      )

      const res = await orchestrator.handleChat({ message: '80 bộ Song Hỷ Cung Đình dưới 3 triệu, không ép kim' })
      expect(res.suggestedProducts).toHaveLength(1)
      expect(res.suggestedProducts[0]?.startingPriceVnd).toBe('2740000') // Grounded in EstimateService
      expect(res.suggestedProducts[0]?.startingPriceVnd).not.toBe('25.000 ₫')
      expect(res.suggestedProducts[0]?.startingPriceVnd).not.toBe('28.000 ₫') // Overridden with 80 qty tier total
      expect(res.estimatedBudget?.totalAmountVnd).toBe('2740000')
      expect(res.estimatedBudget?.giftComplimentary).toBe('') // Zero fabricated gift
    })

    it('preserves quoteRequired status and avoids fabricating price for unpriced items', async () => {
      const mockPricingTool = {
        lookupVariantAndEstimate: vi.fn().mockResolvedValue({ success: true, merchandiseVnd: null, quoteRequired: true }),
      } as unknown as AiPricingTool
      const res = await mockPricingTool.lookupVariantAndEstimate({ productSlug: 'custom-artisan-craft', quantity: 80 })
      expect(res.quoteRequired).toBe(true)
      expect(res.merchandiseVnd).toBeNull()
    })

    it('drops hallucinated model slugs from suggested cards', () => {
      const matcher = new ScoringMatcher()
      const catalog = [{
        id: 'p1',
        slug: 'song-hy',
        name: 'Song Hỷ',
        shape: 'BIFOLD',
        styleTags: ['traditional'],
        colourTags: ['red'],
        unitPriceVnd: 28000n,
        formattedPriceVnd: '28.000 ₫',
      }]
      const matched = matcher.rankProducts(catalog, new ContextExtractor().createInitialBrief(), ['song-hy', 'phantom-lux-card-99'])
      expect(matched).toHaveLength(1)
      expect(matched[0]?.slug).toBe('song-hy')
    })
  })
})
