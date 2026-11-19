import { describe, expect, it, vi } from 'vitest'
import { auditAndEnhanceBespokeDesign, contrastRatio } from './agent-design-auditor.js'
import { searchDesignSystem } from './agent-design-systems.js'
import { AgentLoopService } from './agent-loop.service.js'
import { searchMotionArtworkKits } from './agent-motion-kits.js'
import { AgentToolExecutorService } from './agent-tool-executor.service.js'
import { ContextExtractor } from './context-extractor.js'
import type { GroqAiGateway } from './groq-ai-gateway.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

describe('UI/UX Pro Max Design Intelligence & Motion Kits', () => {
  it('selects matching design systems with WCAG >= 4.5:1 contrast', () => {
    const cyber = searchDesignSystem('cyberpunk rồng bay phượng múa neon')
    expect(cyber.id).toBe('cyberpunk-neon')
    expect(contrastRatio(cyber.theme.bg, cyber.theme.text)).toBeGreaterThanOrEqual(4.5)

    const imperial = searchDesignSystem('thiệp cưới đỏ trung hoa song hỷ cung đình')
    expect(imperial.id).toBe('imperial-heritage')
    expect(contrastRatio(imperial.theme.bg, imperial.theme.text)).toBeGreaterThanOrEqual(4.5)

    const sakura = searchDesignSystem('hoa anh đào nhật bản pastel')
    expect(sakura.id).toBe('sakura-kyoto')
    expect(contrastRatio(sakura.theme.bg, sakura.theme.text)).toBeGreaterThanOrEqual(4.5)
  })

  it('returns layered dragon-phoenix + cyberpunk motion artwork kits for hybrid prompts', () => {
    const kits = searchMotionArtworkKits('rồng bay phượng múa kiểu cyberpunk neon')
    const ids = kits.map((k) => k.id)
    expect(ids).toContain('dragon-phoenix')
    expect(ids).toContain('cyberpunk-grid')
    expect(kits[0]?.htmlSnippet).toContain('<svg')
    expect(kits[0]?.cssSnippet).toContain('@keyframes')
  })

  it('auto-fixes low WCAG contrast, strips AI watermark & emoji slop, and injects reduced-motion', () => {
    const { design, audit } = auditAndEnhanceBespokeDesign({
      conceptName: 'Test Slop',
      typography: 'editorial-serif',
      frameStyle: 'glass-card',
      bgPattern: 'none',
      ornament: 'minimal-line',
      heroLayout: 'full-overlay',
      theme: {
        bg: '#101420',
        surface: '#181E30',
        text: '#222838',
        muted: '#8899AA',
        accent: '#E5BE67',
        border: '#3A4660',
        buttonText: '#FFF8DC',
      },
      sectionOrder: ['hero', 'event-card'],
      customHtml: '<main><h1>🎉 Minh Quân & Thảo Vy</h1><footer>MORI BESPOKE AI</footer></main>',
      customCss: '.hero{animation:float 5s infinite}@keyframes float{to{transform:translateY(-6px)}}',
    })

    expect(audit.wcagTextContrast).toBeGreaterThanOrEqual(4.5)
    expect(audit.wcagButtonContrast).toBeGreaterThanOrEqual(4.5)
    expect(design.customHtml).not.toContain('MORI BESPOKE AI')
    expect(design.customHtml).not.toContain('🎉')
    expect(design.customCss).toContain('prefers-reduced-motion')
    expect(audit.autoFixes.length).toBeGreaterThanOrEqual(3)
  })

  it('orchestrates get_design_system + get_motion_artwork_kit before generate_bespoke_invitation', async () => {
    const mockGateway = {
      executeToolStep: vi
        .fn()
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            { id: 'c1', type: 'function', function: { name: 'get_design_system', arguments: '{"query":"cyberpunk neon"}' } },
            { id: 'c2', type: 'function', function: { name: 'get_motion_artwork_kit', arguments: '{"motif":"rồng bay phượng múa cyberpunk"}' } },
          ],
          modelUsed: 'mock-pro-max',
          fallbackTier: 1,
          latencyMs: 25,
        })
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            {
              id: 'c3',
              type: 'function',
              function: {
                name: 'generate_bespoke_invitation',
                arguments: JSON.stringify({
                  conceptName: 'Long Phụng Neon',
                  typography: 'modern-sans',
                  frameStyle: 'glass-card',
                  bgPattern: 'starry-dots',
                  ornament: 'constellation',
                  heroLayout: 'full-overlay',
                  theme: { bg: '#070914', surface: '#11162B', text: '#F2F6FF', muted: '#9DB2D6', accent: '#00E5FF', border: '#2A3F6E', buttonText: '#06101D' },
                  sectionOrder: ['hero', 'event-card'],
                  groomName: 'Minh Quân',
                  brideName: 'Thảo Vy',
                  customHtml: '<div class="lp-sky"><svg viewBox="0 0 10 10"><path d="M0 0"/></svg><h1>{{GROOM_NAME}} & {{BRIDE_NAME}}</h1></div>',
                  customCss: '@keyframes g{to{transform:translateX(10px)}}',
                }),
              },
            },
          ],
          modelUsed: 'mock-pro-max',
          fallbackTier: 1,
          latencyMs: 35,
        })
        .mockResolvedValueOnce({
          content: 'MORI đã thiết kế mẫu Long Phụng Neon với hiệu ứng rồng bay phượng múa cyberpunk! <!--FOLLOWUPS: Đổi màu sang đỏ vàng cung đình | Dán ảnh cưới vào bìa thiệp | Chỉnh rồng bay chậm lại-->',
          toolCalls: [],
          modelUsed: 'mock-pro-max',
          fallbackTier: 1,
          latencyMs: 15,
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
      { message: 'tạo mẫu có animation rồng bay phượng múa kiểu cyberpunk' },
      [],
      new ContextExtractor().createInitialBrief(),
    )

    expect(res.toolTraces?.map((t) => t.tool)).toEqual([
      'get_design_system',
      'get_motion_artwork_kit',
      'generate_bespoke_invitation',
    ])
    expect(res.toolTraces?.[2]?.output?.['qualityScore']).toBeGreaterThanOrEqual(90)
    expect(res.proposedActions?.[0]?.type).toBe('BESPOKE_DESIGN_PREVIEW')
    expect(res.quickFollowUps).toContain('Đổi màu sang đỏ vàng cung đình')
  })
})
