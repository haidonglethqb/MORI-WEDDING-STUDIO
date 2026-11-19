import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { StorefrontOrderService } from '../orders/storefront-order.service.js'
import { AgentLoopService } from './agent-loop.service.js'
import { AgentToolExecutorService } from './agent-tool-executor.service.js'
import type { AiPricingTool } from './ai-pricing-tool.js'
import type { CatalogProductItem } from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import type { GroqAiGateway } from './groq-ai-gateway.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

const CATALOG: CatalogProductItem[] = [
  {
    id: 'p1',
    slug: 'editorial-bifold-01',
    name: "L'Amour Vogue No. 1",
    shape: 'BIFOLD',
    styleTags: ['editorial'],
    colourTags: ['ivory'],
    unitPriceVnd: 15000n,
    formattedPriceVnd: '15.000 ₫',
    imageUrl: '/images/products/editorial/editorial-bifold-01.jpg',
    isFixture: false,
  },
]

describe('AgentLoopService & AgentToolExecutorService', () => {
  let tempDir = ''
  afterEach(() => {
    delete process.env['MORI_STOREFRONT_DATA_DIR']
    if (tempDir) rmSync(tempDir, { recursive: true, force: true })
  })

  it('runs multi-step tool calling for search, combo quote (50% off), and add-to-cart action', async () => {
    const mockGateway = {
      executeToolStep: vi
        .fn()
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            { id: 'c1', type: 'function', function: { name: 'search_catalog', arguments: '{"style":"editorial"}' } },
            { id: 'c2', type: 'function', function: { name: 'calculate_quote', arguments: '{"paperSlug":"editorial-bifold-01","quantity":100,"digitalSlug":"editorial-digital-01"}' } },
          ],
          modelUsed: 'mock-agent',
          fallbackTier: 1,
          latencyMs: 30,
        })
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            { id: 'c3', type: 'function', function: { name: 'propose_add_to_cart', arguments: '{"productType":"COMBO","slug":"editorial-bifold-01","quantity":100,"linkedDigitalSlug":"editorial-digital-01"}' } },
          ],
          modelUsed: 'mock-agent',
          fallbackTier: 1,
          latencyMs: 25,
        })
        .mockResolvedValueOnce({
          content: 'MORI đã tính combo 100 bộ L’Amour Vogue No. 1 kèm thiệp online giảm 50% chỉ còn 299.500 ₫.',
          toolCalls: [],
          modelUsed: 'mock-agent',
          fallbackTier: 1,
          latencyMs: 20,
        }),
    } as unknown as GroqAiGateway

    const mockPricingTool = {
      lookupVariantAndEstimate: vi.fn().mockResolvedValue({ success: true, merchandiseVnd: '1500000', quoteRequired: false }),
    } as unknown as AiPricingTool

    const executor = new AgentToolExecutorService(mockPricingTool)
    const loop = new AgentLoopService(mockGateway, executor, new ContextExtractor(), new ScoringMatcher(), new SupervisorGuardrail())

    const events: string[] = []
    const res = await loop.run(
      { message: 'Tính giúp combo 100 bộ Vogue + thiệp online giảm 50%' },
      CATALOG,
      new ContextExtractor().createInitialBrief(),
      (ev) => events.push(ev.type),
    )

    expect(res.toolTraces).toHaveLength(3)
    expect(res.toolTraces?.[0]?.input).toEqual({ style: 'editorial' })
    expect(res.toolTraces?.[1]?.output?.['comboDiscountApplied']).toBe(true)
    expect(res.estimatedBudget?.totalAmountVnd).toBe('1.799.500 ₫')
    expect(res.proposedActions?.[0]).toMatchObject({ type: 'ADD_TO_CART', productType: 'COMBO', slug: 'editorial-bifold-01', linkedDigitalSlug: 'editorial-digital-01' })
    expect(res.suggestedProducts[0]?.slug).toBe('editorial-bifold-01')
    expect(events).toContain('tool_start')
    expect(events).toContain('tool_done')
    expect(events).toContain('delta')
  })

  it('tracks real seeded storefront order and rejects hallucinated cart slugs', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'mori-agent-orders-'))
    process.env['MORI_STOREFRONT_DATA_DIR'] = tempDir
    const orderService = new StorefrontOrderService()
    const created = orderService.createOrder({
      customerName: 'Minh Anh',
      customerPhone: '0909888777',
      customerEmail: '',
      address: '',
      city: '',
      note: '',
      paymentMethod: 'COD',
      paymentOption: 'FULL',
      simulatePaid: false,
      items: [{ slug: 'editorial-digital-01', name: 'Digital Vogue Luxe', productType: 'DIGITAL', quantity: 1, unitAmountVnd: 599000 }],
    })

    const executor = new AgentToolExecutorService(undefined, orderService)
    const tracked = await executor.execute('track_order', { code: created.code, contact: '0909888777' }, CATALOG)
    expect(tracked.output['found']).toBe(true)
    expect(tracked.output['code']).toBe(created.code)

    const badCart = await executor.execute('propose_add_to_cart', { productType: 'PAPER', slug: 'fake-hallucinated-slug', quantity: 100 }, CATALOG)
    expect(badCart.action).toBeUndefined()
    expect(badCart.output['ok']).toBe(false)
  })

  it('activates deterministic agent fallback with digital draft action and strips Zalo', async () => {
    const mockGateway = { executeToolStep: vi.fn().mockRejectedValue(new Error('offline')) } as unknown as GroqAiGateway
    const executor = new AgentToolExecutorService()
    const loop = new AgentLoopService(mockGateway, executor, new ContextExtractor(), new ScoringMatcher(), new SupervisorGuardrail())

    const brief = new ContextExtractor().createInitialBrief()
    brief.coupleNames = 'Quốc Bảo & Minh Anh'

    const res = await loop.run({ message: 'Tạo thiệp online Song Hỷ cho hai bạn' }, CATALOG, brief)
    expect(res.meta.modelUsed).toBe('fallback/agent-offline')
    expect(res.proposedActions?.some((a) => a.type === 'CREATE_DIGITAL_INVITATION' && a.templateId === 'heritage-palace')).toBe(true)
    expect(res.reply).not.toMatch(/\bzalo\b/i)
  })
})
