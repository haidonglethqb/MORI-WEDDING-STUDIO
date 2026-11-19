import { describe, expect, it, vi } from 'vitest'
import { executeGenerateBespokeInvitation } from './agent-bespoke-builder.js'
import { buildSmartFollowUps, extractInlineFollowUps } from './agent-followups.js'
import { AgentLoopService } from './agent-loop.service.js'
import { AgentToolExecutorService } from './agent-tool-executor.service.js'
import type { CatalogProductItem } from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import type { GroqAiGateway } from './groq-ai-gateway.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

const CATALOG: CatalogProductItem[] = []

describe('generate_bespoke_invitation builder & agent loop', () => {
  it('builds a schema-valid bespoke design blueprint and auto-attaches uploaded couple photo', () => {
    const outcome = executeGenerateBespokeInvitation(
      {
        conceptName: 'Đêm Sao Đà Lạt',
        eyebrowTag: 'SAVE THE DATE · ĐÀ LẠT 2026',
        typography: 'romantic-italic',
        frameStyle: 'glass-card',
        bgPattern: 'starry-dots',
        ornament: 'constellation',
        heroLayout: 'full-overlay',
        theme: {
          bg: '#0f1a2b',
          bgAccent: '#1b2d48',
          surface: '#17263d',
          text: '#f5efe6',
          muted: '#b8c4d8',
          accent: '#d4af37',
          border: '#2d415e',
          buttonText: '#0f1a2b',
        },
        sectionOrder: ['hero', 'couple-bio', 'story', 'event-card', 'dress-code', 'countdown'],
        groomName: 'Minh Quân',
        brideName: 'Thảo Vy',
        groomMeta: '28 tuổi · Kiến trúc sư',
        brideMeta: '26 tuổi · Nhà thiết kế thời trang',
        weddingDate: '20261122T180000',
        venueName: 'Ana Mandara Villas Đà Lạt',
        storyMilestones: [
          { year: '2021', title: 'Lần đầu gặp gỡ', detail: 'Một chiều mưa tại quán cà phê nhỏ ở Sài Gòn.' },
        ],
        dressCode: {
          title: 'Starry Night Elegance',
          note: 'Trang phục xanh đêm, vàng champagne hoặc trắng ngà.',
          swatches: ['#0f1a2b', '#d4af37', '#f5efe6'],
        },
      },
      [{ kind: 'image', dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', label: 'couple.jpg' }],
    )

    expect(outcome.output['ok']).toBe(true)
    expect(outcome.output['attachedUserPhoto']).toBe(true)
    expect(outcome.action?.type).toBe('BESPOKE_DESIGN_PREVIEW')
    if (outcome.action?.type === 'BESPOKE_DESIGN_PREVIEW') {
      expect(outcome.action.customDesign.conceptName).toBe('Đêm Sao Đà Lạt')
      expect(outcome.action.customDesign.theme.bg).toBe('#0F1A2B')
      expect(outcome.action.customDesign.coupleBio?.groomMeta).toContain('28 tuổi')
      expect(outcome.action.customDesign.storyMilestones).toHaveLength(1)
      expect(outcome.action.draftData.heroUrl).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==')
      expect(outcome.action.draftData.eventLocalStart).toBe('20261122T180000')
    }
  })

  it('safely falls back invalid hex colors and malformed section order', () => {
    const outcome = executeGenerateBespokeInvitation({
      conceptName: 'Minimal Test',
      typography: 'invalid-font',
      frameStyle: 'unknown-frame',
      theme: {
        bg: 'javascript:alert(1)',
        surface: 'not-a-hex',
        text: '#222222',
      },
      sectionOrder: ['event-card', 'invalid-section', 'event-card'],
      groomName: 'Hoàng',
      brideName: 'Nhi',
    })

    expect(outcome.action?.type).toBe('BESPOKE_DESIGN_PREVIEW')
    if (outcome.action?.type === 'BESPOKE_DESIGN_PREVIEW') {
      expect(outcome.action.customDesign.theme.bg).toMatch(/^#[0-9A-F]{6}$/)
      expect(outcome.action.customDesign.theme.surface).toMatch(/^#[0-9A-F]{6}$/)
      expect(outcome.action.customDesign.sectionOrder[0]).toBe('hero')
      expect(outcome.action.customDesign.sectionOrder).toContain('event-card')
      expect(outcome.action.customDesign.typography).toBe('editorial-serif')
    }
  })

  it('emits BESPOKE_DESIGN_PREVIEW and logs tool traces through AgentLoopService', async () => {
    const mockGateway = {
      executeToolStep: vi
        .fn()
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            {
              id: 'call-bsp-1',
              type: 'function',
              function: {
                name: 'generate_bespoke_invitation',
                arguments: JSON.stringify({
                  conceptName: 'Biển Xanh Sunset',
                  typography: 'editorial-serif',
                  frameStyle: 'arch-dome',
                  bgPattern: 'gold-aura',
                  ornament: 'wax-seal',
                  heroLayout: 'arch-portrait',
                  theme: { bg: '#FFF8F0', surface: '#FFFFFF', text: '#24231F', muted: '#6E695E', accent: '#C46D45', border: '#E4C7B2', buttonText: '#FFFFFF' },
                  sectionOrder: ['hero', 'event-card', 'countdown'],
                  groomName: 'Nam',
                  brideName: 'Phương',
                }),
              },
            },
          ],
          modelUsed: 'mock-bespoke-llm',
          fallbackTier: 1,
          latencyMs: 42,
        })
        .mockResolvedValueOnce({
          content: 'MORI đã thiết kế xong mẫu Biển Xanh Sunset dành riêng cho Nam & Phương!',
          toolCalls: [],
          modelUsed: 'mock-bespoke-llm',
          fallbackTier: 1,
          latencyMs: 18,
        }),
    } as unknown as GroqAiGateway

    const loop = new AgentLoopService(
      mockGateway,
      new AgentToolExecutorService(),
      new ContextExtractor(),
      new ScoringMatcher(),
      new SupervisorGuardrail(),
    )

    const res = await loop.run(
      { message: 'Thiết kế riêng giúp mình mẫu thiệp biển hoàng hôn cho Nam & Phương' },
      CATALOG,
      new ContextExtractor().createInitialBrief(),
    )

    expect(res.toolTraces).toHaveLength(1)
    expect(res.toolTraces?.[0]?.tool).toBe('generate_bespoke_invitation')
    expect(res.toolTraces?.[0]?.output?.['conceptName']).toBe('Biển Xanh Sunset')
    expect(res.proposedActions?.[0]?.type).toBe('BESPOKE_DESIGN_PREVIEW')
    expect(res.reply).toContain('Biển Xanh Sunset')
  })

  it('sanitizes customHtml and customCss while keeping SVG animations and HERO_PHOTO token', () => {
    const outcome = executeGenerateBespokeInvitation({
      conceptName: 'Long Phụng Sum Vầy',
      groomName: 'Minh Quân',
      brideName: 'Thảo Vy',
      customHtml:
        '<section class="card"><svg viewBox="0 0 100 100"><path d="M10 10" /></svg><img src="{{HERO_PHOTO}}" onclick="alert(1)" /><script>alert(1)</script></section>',
      customCss:
        '@import url("https://evil.test/x.css"); .card{animation:fly 6s infinite;background:url(https://evil.test/a.png)} @keyframes fly{to{transform:translateX(20px)}}',
    })

    expect(outcome.output['hasCustomCanvas']).toBe(true)
    if (outcome.action?.type === 'BESPOKE_DESIGN_PREVIEW') {
      const html = outcome.action.customDesign.customHtml ?? ''
      const css = outcome.action.customDesign.customCss ?? ''
      expect(html).toContain('<svg')
      expect(html).toContain('{{HERO_PHOTO}}')
      expect(html).not.toContain('<script')
      expect(html).not.toContain('onclick')
      expect(css).toContain('@keyframes fly')
      expect(css).not.toContain('@import')
      expect(css).not.toContain('evil.test')
    }
  })

  it('extracts contextual inline follow-ups and deduplicates repeated user messages', () => {
    const parsed = extractInlineFollowUps(
      'MORI đã tạo xong mẫu! <!--FOLLOWUPS: Đổi màu xanh đậm | Tạo thiệp cưới online | Thêm lịch trình buổi lễ-->',
    )
    expect(parsed.reply).toBe('MORI đã tạo xong mẫu!')
    expect(parsed.inlineFollowUps).toEqual(['Đổi màu xanh đậm', 'Tạo thiệp cưới online', 'Thêm lịch trình buổi lễ'])

    const deduped = buildSmartFollowUps({
      inlineFollowUps: parsed.inlineFollowUps,
      actions: [],
      brief: new ContextExtractor().createInitialBrief(),
      history: [{ role: 'user', content: 'Tạo thiệp cưới online' }],
      lastUserMessage: 'Tạo thiệp cưới online',
    })
    expect(deduped).not.toContain('Tạo thiệp cưới online')
    expect(deduped).toContain('Đổi màu xanh đậm')
  })
})
