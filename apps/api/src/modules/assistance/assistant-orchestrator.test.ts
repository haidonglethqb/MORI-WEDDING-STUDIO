import { describe, expect, it, vi } from 'vitest'
import { ContextExtractor } from './context-extractor.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

describe('ContextExtractor', () => {
  const extractor = new ContextExtractor()

  it('preserves existing brief attributes on delta merge', () => {
    const base = extractor.createInitialBrief()
    base.coupleNames = 'Huy & Trang'
    base.location = 'Đà Lạt'
    base.guestCount = 120

    const updated = extractor.mergeBrief(base, {
      weddingDate: '15/12/2026',
      aestheticIdentity: 'FLORAL_BOTANICAL',
    })

    expect(updated.coupleNames).toBe('Huy & Trang')
    expect(updated.location).toBe('Đà Lạt')
    expect(updated.guestCount).toBe(120)
    expect(updated.weddingDate).toBe('15/12/2026')
    expect(updated.aestheticIdentity).toBe('FLORAL_BOTANICAL')
  })

  it('boosts entities from conversational text', () => {
    const base = extractor.createInitialBrief()
    const boosted = extractor.boostFromText(
      base,
      'Tụi mình là Huy & Trang, cưới ở Đà Lạt tháng 12, tiệc ngoài trời khoảng 150 khách nhé',
    )
    expect(boosted.coupleNames).toBe('Huy & Trang')
    expect(boosted.location).toBe('Đà Lạt')
    expect(boosted.season).toBe('WINTER')
    expect(boosted.venueCategory).toBe('OUTDOOR_GARDEN')
    expect(boosted.guestCount).toBe(150)
    expect(boosted.estimatedSuites).toBe(98)
  })
})

describe('AssistantOrchestratorService', () => {
  const extractor = new ContextExtractor()
  const matcher = new ScoringMatcher()
  const estimator = new BespokeEstimator()
  const guardrail = new SupervisorGuardrail()

  it('sanitizes banned payment keywords (INV-13) and generates cards', async () => {
    const mockGateway = {
      executeCompletion: vi.fn().mockResolvedValue({
        data: {
          reply: 'Vui lòng chuyển khoản đặt cọc qua số tài khoản để hoàn tất thanh toán online.',
          suggestedSlugs: ['floral-bifold-01'],
        },
        modelUsed: 'openai/gpt-oss-120b',
        fallbackTier: 1,
        latencyMs: 320,
      }),
    } as unknown as GroqAiGateway

    const mockCatalogProvider = {
      getActiveProducts: vi.fn().mockResolvedValue([
        {
          id: '1',
          slug: 'floral-bifold-01',
          name: 'Botanical Herbarium',
          shape: 'BIFOLD',
          styleTags: ['floral'],
          colourTags: ['sage'],
          unitPriceVnd: 35000n,
          formattedPriceVnd: '35.000 ₫',
        },
      ]),
    } as unknown as CatalogProvider

    const orchestrator = new AssistantOrchestratorService(
      mockGateway,
      extractor,
      mockCatalogProvider,
      matcher,
      estimator,
      guardrail,
    )

    const res = await orchestrator.handleChat({ message: 'Tư vấn thiệp' })
    expect(res.reply).not.toContain('chuyển khoản')
    expect(res.reply).not.toContain('đặt cọc')
    expect(res.reply).not.toContain('số tài khoản')
    expect(res.reply).toContain('quy trình may đo')
    expect(res.suggestedProducts.length).toBeGreaterThan(0)
    expect(res.suggestedProducts[0]?.slug).toBe('floral-bifold-01')
  })

  it('activates deterministic local fallback gracefully when Groq fails', async () => {
    const mockGateway = {
      executeCompletion: vi.fn().mockRejectedValue(new Error('Groq network timeout')),
    } as unknown as GroqAiGateway

    const mockCatalogProvider = {
      getActiveProducts: vi.fn().mockResolvedValue([
        {
          id: '1',
          slug: 'floral-bifold-01',
          name: 'Botanical Herbarium',
          shape: 'BIFOLD',
          styleTags: ['floral'],
          colourTags: ['sage'],
          unitPriceVnd: 35000n,
          formattedPriceVnd: '35.000 ₫',
        },
      ]),
    } as unknown as CatalogProvider

    const orchestrator = new AssistantOrchestratorService(
      mockGateway,
      extractor,
      mockCatalogProvider,
      matcher,
      estimator,
      guardrail,
    )

    const res = await orchestrator.handleChat({ message: 'Tiệc sân vườn Đà Lạt 120 khách' })
    expect(res.meta.fallbackTier).toBe(4)
    expect(res.meta.modelUsed).toBe('deterministic/local-mori-atelier')
    expect(res.reply).toContain('Master Pierre-Minh & Vũ Cầm')
    expect(res.estimatedBudget).not.toBeNull()
    expect(res.estimatedBudget?.giftComplimentary).toContain('1.200.000 ₫')
  })
})
