import { describe, expect, it, vi } from 'vitest'
import { ContextExtractor } from './context-extractor.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { RecommendationService } from './recommendation.service.js'

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
      'Tụi mình cưới ở Đà Lạt, tiệc ngoài trời khoảng 150 khách nhé',
    )
    expect(boosted.location).toBe('Đà Lạt')
    expect(boosted.venueCategory).toBe('OUTDOOR_GARDEN')
    expect(boosted.guestCount).toBe(150)
  })
})

describe('AssistantOrchestratorService', () => {
  it('sanitizes banned payment keywords (INV-13)', async () => {
    const mockGateway = {
      executeCompletion: vi.fn().mockResolvedValue({
        data: {
          reply: 'Vui lòng chuyển khoản đặt cọc qua số tài khoản để hoàn tất thanh toán online.',
          suggestedSlugs: [],
        },
        modelUsed: 'openai/gpt-oss-120b',
        fallbackTier: 1,
        latencyMs: 320,
      }),
    } as unknown as GroqAiGateway

    const mockFallback = {
      recommend: vi.fn(),
    } as unknown as RecommendationService

    const orchestrator = new AssistantOrchestratorService(
      mockGateway,
      new ContextExtractor(),
      mockFallback,
    )

    const res = await orchestrator.handleChat({ message: 'Tư vấn thiệp' })
    expect(res.reply).not.toContain('chuyển khoản')
    expect(res.reply).not.toContain('đặt cọc')
    expect(res.reply).not.toContain('số tài khoản')
    expect(res.reply).not.toContain('thanh toán online')
  })

  it('activates local fallback gracefully when Groq fails', async () => {
    const mockGateway = {
      executeCompletion: vi.fn().mockRejectedValue(new Error('Groq network timeout')),
    } as unknown as GroqAiGateway

    const mockFallback = {
      recommend: vi.fn().mockResolvedValue({
        clarification: null,
        provider: 'DISABLED',
        results: [{ slug: 'editorial-bifold-01', name: 'Vogue', merchandiseVnd: '45000' }],
      }),
    } as unknown as RecommendationService

    const orchestrator = new AssistantOrchestratorService(
      mockGateway,
      new ContextExtractor(),
      mockFallback,
    )

    const res = await orchestrator.handleChat({ message: 'Tiệc sân vườn' })
    expect(res.meta.fallbackTier).toBe(4)
    expect(res.meta.modelUsed).toBe('deterministic/local-mori-atelier')
    expect(res.reply).toContain('Master Pierre-Minh')
  })
})
