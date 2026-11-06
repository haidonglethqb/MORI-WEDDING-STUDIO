/**
 * Adversarial Slug Rejection & Hallucination Defense Suite (Milestone 2 / PR-01)
 * Empirically challenges system with fabricated and non-existent product slugs.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { AiPricingTool } from './ai-pricing-tool.js'
import { EstimateService } from '../pricing/estimate.service.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { ContextExtractor } from './context-extractor.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import type { CatalogProductItem } from './assistant-types.js'
import type { GroqAiGateway } from './groq-ai-gateway.js'
import type { CatalogProvider } from './catalog-provider.js'

describe('Adversarial Challenge: Slug Rejection & Hallucination Defense (T14)', () => {
  const prisma = getPrismaClient()
  const estimateService = new EstimateService()
  const pricingTool = new AiPricingTool(estimateService)
  const matcher = new ScoringMatcher()
  const extractor = new ContextExtractor()
  const testArchivedSlug = `adversarial-archived-${Date.now()}`

  beforeAll(async () => {
    await prisma.product.create({
      data: {
        slug: testArchivedSlug,
        name: 'Archived Collection Suite',
        description: 'Archived test item',
        type: 'PAPER',
        state: 'ARCHIVED',
        isFixture: true,
        styleTags: ['traditional'],
        colourTags: ['gold'],
      },
    })
  })

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { slug: testArchivedSlug } })
    await disconnectPrismaClient()
  })

  describe('1. AiPricingTool lookupVariantAndEstimate Slug Rejection', () => {
    const maliciousAndUnknownSlugs = [
      'non-existent-luxury-suite-999',
      'hallucinated-royal-gold-suite',
      "sql-injection'-or-1=1--",
      '<script>alert(1)</script>',
      '../../../etc/passwd',
      '',
    ]

    maliciousAndUnknownSlugs.forEach((badSlug) => {
      it(`rejects unknown or malformed slug "${badSlug}" with NOT_FOUND and quoteRequired`, async () => {
        const res = await pricingTool.lookupVariantAndEstimate({ productSlug: badSlug, quantity: 80 })
        expect(res.success).toBe(false)
        expect(res.status).toBe('NOT_FOUND')
        expect(res.quoteRequired).toBe(true)
        expect(res.merchandiseVnd).toBeNull()
        expect(res.message).toBe('Mẫu sản phẩm không tồn tại trong hệ thống')
      })
    })

    it('rejects ARCHIVED products even if slug exists in database', async () => {
      const res = await pricingTool.lookupVariantAndEstimate({ productSlug: testArchivedSlug, quantity: 80 })
      expect(res.success).toBe(false)
      expect(res.status).toBe('NOT_FOUND')
      expect(res.quoteRequired).toBe(true)
      expect(res.merchandiseVnd).toBeNull()
    })
  })

  describe('2. ScoringMatcher Hallucinated Slug Filtering', () => {
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
      {
        id: 'p2',
        slug: 'minimalist-flat-01',
        name: 'Minimalist Phẳng',
        shape: 'FLAT',
        styleTags: ['minimalist'],
        colourTags: ['ivory'],
        unitPriceVnd: 25000n,
        formattedPriceVnd: '25.000 ₫',
      },
    ]

    it('discards hallucinated slugs from mixed suggestions', () => {
      const brief = extractor.createInitialBrief()
      const mixedSlugs = [
        'non-existent-luxury-suite-999',
        'song-hy-cung-dinh',
        'fake-diamond-suite',
        'minimalist-flat-01',
      ]

      const ranked = matcher.rankProducts(catalog, brief, mixedSlugs)
      expect(ranked).toHaveLength(2)
      expect(ranked.map((p) => p.slug)).toEqual(['song-hy-cung-dinh', 'minimalist-flat-01'])
      expect(ranked.some((p) => p.slug === 'non-existent-luxury-suite-999')).toBe(false)
      expect(ranked.some((p) => p.slug === 'fake-diamond-suite')).toBe(false)
    })

    it('returns empty array when model suggests ONLY fabricated slugs', () => {
      const brief = extractor.createInitialBrief()
      const purelyHallucinated = ['fake-1', 'fake-2', 'phantom-suite']

      const ranked = matcher.rankProducts(catalog, brief, purelyHallucinated)
      expect(ranked).toEqual([])
      expect(ranked).toHaveLength(0)
    })
  })

  describe('3. AssistantOrchestrator End-to-End Grounding Defense', () => {
    it('never leaks hallucinated slugs into suggestedProducts cards', async () => {
      const activeCatalog: CatalogProductItem[] = [
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

      const mockGateway = {
        executeCompletion: vi.fn().mockResolvedValue({
          data: {
            reply: 'Chúng tôi gợi ý mẫu Song Hỷ Cung Đình và mẫu Phantom Luxury Suite 999.',
            suggestedSlugs: ['non-existent-luxury-suite-999', 'phantom-luxury-suite'],
          },
          modelUsed: 'mock-llm',
          fallbackTier: 1,
          latencyMs: 15,
        }),
      } as unknown as GroqAiGateway

      const mockCatalogProvider = {
        getActiveProducts: vi.fn().mockResolvedValue(activeCatalog),
      } as unknown as CatalogProvider

      const orchestrator = new AssistantOrchestratorService(
        mockGateway,
        extractor,
        mockCatalogProvider,
        matcher,
        new BespokeEstimator(),
        new SupervisorGuardrail(),
        pricingTool,
      )

      const res = await orchestrator.handleChat({
        message: 'Tư vấn thiệp truyền thống cho tiệc 80 bộ',
      })

      // The reply mentioned Song Hy Cung Dinh so it got matched from catalog
      // Phantom luxury suite was hallucinated and MUST NOT be in suggestedProducts
      expect(res.suggestedProducts.length).toBeLessThanOrEqual(1)
      for (const card of res.suggestedProducts) {
        expect(card.slug).not.toBe('non-existent-luxury-suite-999')
        expect(card.slug).not.toBe('phantom-luxury-suite')
      }
    })
  })
})
