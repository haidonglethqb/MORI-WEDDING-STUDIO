import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ContextExtractor } from './context-extractor.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { AiLogService } from './ai-log.service.js'

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

  it('preserves demo payment guidance, strips Zalo mentions, and generates cards', async () => {
    const mockGateway = {
      executeCompletion: vi.fn().mockResolvedValue({
        data: {
          reply:
            'Bạn có thể đặt thiệp và thanh toán demo qua MoMo, VNPAY, Chuyển khoản QR hoặc COD, hoặc nhắn Zalo nếu cần hỗ trợ.',
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
          unitPriceVnd: 11000n,
          formattedPriceVnd: '11.000 ₫',
          imageUrl: '/images/products/floral/floral-bifold-01.jpg',
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
    expect(res.reply).toContain('MoMo')
    expect(res.reply).toContain('VNPAY')
    expect(res.reply).not.toMatch(/\bzalo\b/i)
    expect(res.reply).toContain('Chuyển yêu cầu gặp nhân viên')
    expect(res.suggestedProducts.length).toBeGreaterThan(0)
    expect(res.suggestedProducts[0]?.slug).toBe('floral-bifold-01')
    expect(res.suggestedProducts[0]?.imageUrl).toBe('/images/products/floral/floral-bifold-01.jpg')
  })

  describe('escalation handoff', () => {
    let tempDir = ''
    afterEach(() => {
      delete process.env['MORI_AI_LOG_PATH']
      if (tempDir) rmSync(tempDir, { recursive: true, force: true })
    })

    it('auto-escalates session when customer asks to talk to human staff or Admin', async () => {
      tempDir = mkdtempSync(join(tmpdir(), 'mori-orch-'))
      process.env['MORI_AI_LOG_PATH'] = join(tempDir, 'ai-sessions.json')
      const logService = new AiLogService()
      const mockGateway = { executeCompletion: vi.fn() } as unknown as GroqAiGateway
      const mockCatalogProvider = { getActiveProducts: vi.fn().mockResolvedValue([]) } as unknown as CatalogProvider

      const orchestrator = new AssistantOrchestratorService(
        mockGateway,
        extractor,
        mockCatalogProvider,
        matcher,
        estimator,
        guardrail,
        undefined,
        logService,
      )

      const res = await orchestrator.handleChat({ message: 'Mình muốn gặp nhân viên tư vấn trực tiếp' }, 'sess-esc-1')
      expect(res.needsHumanSupport).toBe(true)
      expect(res.reply).toContain('Admin / nhân viên tư vấn MORI')
      const saved = logService.getSession('sess-esc-1')
      expect(saved?.needsHumanSupport).toBe(true)
      expect(saved?.escalationReason).toBe('Mình muốn gặp nhân viên tư vấn trực tiếp')
    })
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
          unitPriceVnd: 11000n,
          formattedPriceVnd: '11.000 ₫',
          imageUrl: '/images/products/floral/floral-bifold-01.jpg',
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
    expect(res.meta.modelUsed).toBe('fallback/catalog-offline')
    expect(res.reply).not.toContain('Master Pierre-Minh')
    expect(res.reply).not.toContain('1.200.000 ₫')
    expect(res.reply).toContain('tạm thời gián đoạn')
    expect(res.suggestedProducts.length).toBeGreaterThan(0)
  })
})
