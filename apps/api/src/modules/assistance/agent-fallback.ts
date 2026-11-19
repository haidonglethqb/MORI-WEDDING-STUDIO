import { buildSmartFollowUps } from './agent-followups.js'
import type {
  AgentProposedAction,
  AgentStreamEvent,
  AgentToolTraceItem,
} from './agent-types.js'
import type { AgentToolExecutorService } from './agent-tool-executor.service.js'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  CatalogProductItem,
  ConversationWeddingBrief,
  EstimatedBudgetSummary,
} from './assistant-types.js'
import type { ScoringMatcher } from './scoring-matcher.js'
import type { SupervisorGuardrail } from './supervisor-guardrail.js'

export async function runAgentDeterministicFallback(
  req: AssistantChatRequest,
  catalog: CatalogProductItem[],
  brief: ConversationWeddingBrief,
  latencyMs: number,
  deps: {
    executor: AgentToolExecutorService
    matcher: ScoringMatcher
    guardrail: SupervisorGuardrail
  },
  onEvent?: (ev: AgentStreamEvent) => void,
): Promise<AssistantChatResponse> {
  const traces: AgentToolTraceItem[] = []
  const actions: AgentProposedAction[] = []
  let estimatedBudget: EstimatedBudgetSummary | null = null
  const text = req.message.trim()

  const orderMatch = /\bMORI-\d+\b/i.exec(text)
  const phoneOrEmailMatch = /(\+?\d[\d\s]{7,14}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(text)
  if (orderMatch && phoneOrEmailMatch) {
    const tStart = Date.now()
    const trace: AgentToolTraceItem = { id: 'fb-track', tool: 'track_order', label: 'Tra cứu tiến độ đơn hàng', status: 'running' }
    onEvent?.({ type: 'tool_start', trace })
    const trackArgs = { code: orderMatch[0], contact: phoneOrEmailMatch[1] }
    const res = await deps.executor.execute('track_order', trackArgs, catalog)
    const done: AgentToolTraceItem = {
      ...trace,
      status: 'done',
      summary: res.summary,
      durationMs: Date.now() - tStart,
      input: trackArgs,
      output: res.output,
    }
    traces.push(done)
    onEvent?.({ type: 'tool_done', trace: done })

    const out = res.output as { found?: boolean; code?: string; summary?: string; paymentStatus?: string; totalAmountVnd?: string; paperStage?: string; onlineStage?: string; message?: string }
    const reply = out.found
      ? `MORI đã kiểm tra đơn hàng **${out.code}**: ${out.summary ?? ''}. Trạng thái thanh toán: **${out.paymentStatus}** (Tổng: ${out.totalAmountVnd}).${out.paperStage ? ` Thiệp giấy: ${out.paperStage}.` : ''}${out.onlineStage ? ` Thiệp online: ${out.onlineStage}.` : ''}`
      : `${out.message ?? 'Chưa tìm thấy đơn hàng phù hợp.'}`

    return {
      reply: deps.guardrail.sanitizeArtisanReply(reply),
      updatedBrief: brief,
      suggestedProducts: [],
      estimatedBudget: null,
      quickFollowUps: ['Xem trang Theo dõi đơn hàng', 'Gặp nhân viên tư vấn'],
      toolTraces: traces,
      proposedActions: [{ type: 'NAVIGATE', title: 'Mở trang Theo dõi đơn hàng', subtitle: 'Xem chi tiết timeline sản xuất đơn hàng', href: '/order-tracking' }],
      meta: { modelUsed: 'fallback/agent-offline', fallbackTier: 4, latencyMs, groundedProductCount: catalog.length },
    }
  }

  const wantsBespoke = /mẫu mới|thiết kế riêng|độc bản|tự thiết kế|bespoke|phong cách .* (màu|tone)|tạo mẫu/i.test(text)
  const wantsDigitalDraft = /tạo thiệp|thiệp online|website cưới|mẫu thiệp số/i.test(text)
  if (wantsBespoke) {
    const names = (brief.coupleNames ?? 'Minh Quân & Thảo Vy').split(/\s*[&và-]\s*/i)
    const isNight = /đêm|sao|xanh đen|navy|tối|star|midnight/i.test(text)
    const bespokeArgs = {
      conceptName: isNight ? 'Đêm Ánh Nến' : 'Sương Mai Tối Giản',
      eyebrowTag: 'TRÂN TRỌNG KÍNH MỜI',
      typography: isNight ? 'romantic-italic' : 'editorial-serif',
      frameStyle: isNight ? 'glass-card' : 'arch-dome',
      bgPattern: isNight ? 'starry-dots' : 'botanical-wash',
      ornament: isNight ? 'constellation' : 'botanical-branch',
      heroLayout: isNight ? 'full-overlay' : 'arch-portrait',
      theme: isNight
        ? { bg: '#0F1A2B', bgAccent: '#1B2D48', surface: '#17263D', text: '#F5EFE6', muted: '#B8C4D8', accent: '#D4AF37', border: '#2D415E', buttonText: '#0F1A2B' }
        : { bg: '#F7F4EE', bgAccent: '#EAE4D7', surface: '#FFFFFF', text: '#24231F', muted: '#6E695E', accent: '#59634A', border: '#DCD5C6', buttonText: '#FFFFFF' },
      sectionOrder: ['hero', 'couple-bio', 'story', 'event-card', 'dress-code', 'gallery', 'countdown'],
      groomName: names[0]?.trim() || 'Minh Quân',
      brideName: names[1]?.trim() || 'Thảo Vy',
      eventTitle: 'Lễ Thành Hôn & Tiệc Mừng Thân Mật',
      ...(brief.location ? { venueName: brief.location } : {}),
      dressCode: { title: 'Dress Code', note: 'Trang phục dự tiệc thanh lịch theo bảng màu chủ đạo', swatches: isNight ? ['#0F1A2B', '#D4AF37', '#F5EFE6'] : ['#59634A', '#EFE9DD', '#24231F'] },
    }
    const res = await deps.executor.execute('generate_bespoke_invitation', bespokeArgs, catalog, req.attachments)
    if (res.action) actions.push(res.action)
    traces.push({ id: 'fb-bespoke', tool: 'generate_bespoke_invitation', label: 'Thiết kế mẫu Thiệp Online độc bản', status: 'done', summary: res.summary, durationMs: 3, input: bespokeArgs, output: res.output })
  } else if (wantsDigitalDraft) {
    const names = (brief.coupleNames ?? 'Quốc Bảo & Minh Anh').split(/\s*[&và-]\s*/i)
    const groomName = names[0]?.trim() || 'Quốc Bảo'
    const brideName = names[1]?.trim() || 'Minh Anh'
    const templateId = /song hỷ|truyền thống|á đông|đỏ/i.test(text)
      ? 'heritage-palace'
      : /thảo mộc|hoa|tối giản|wabi|zen/i.test(text)
        ? 'botanical-zen'
        : 'editorial-vogue'
    const draftArgs = { templateId, groomName, brideName, venueName: brief.location ?? undefined }
    const res = await deps.executor.execute('propose_create_digital_invitation', draftArgs, catalog)
    if (res.action) actions.push(res.action)
    traces.push({
      id: 'fb-draft',
      tool: 'propose_create_digital_invitation',
      label: 'Chuẩn bị bản nháp Thiệp Online',
      status: 'done',
      summary: res.summary,
      durationMs: 2,
      input: draftArgs,
      output: res.output,
    })
  }

  const matched = deps.matcher.rankProducts(catalog, brief)
  const suggestedCards = deps.guardrail.buildProductCards(matched)
  const topProduct = matched[0]

  if (topProduct && !topProduct.isFixture && (brief.estimatedSuites ?? 0) >= 10) {
    const wantsCombo = /combo|giảm 50%|thiệp online/i.test(text)
    const quoteRes = await deps.executor.execute('calculate_quote', {
      paperSlug: topProduct.slug,
      quantity: brief.estimatedSuites ?? 100,
      ...(wantsCombo ? { digitalSlug: 'editorial-digital-01' } : {}),
    }, catalog)
    if (quoteRes.estimatedBudget) estimatedBudget = quoteRes.estimatedBudget
    const cartRes = await deps.executor.execute('propose_add_to_cart', {
      productType: wantsCombo ? 'COMBO' : 'PAPER',
      slug: topProduct.slug,
      quantity: brief.estimatedSuites ?? 100,
      ...(wantsCombo ? { linkedDigitalSlug: 'editorial-digital-01' } : {}),
    }, catalog)
    if (cartRes.action) actions.push(cartRes.action)
  }

  const coupleGreeting = brief.coupleNames ? `Chào ${brief.coupleNames}, ` : 'Kính chào bạn, '
  const reply = `${coupleGreeting}kết nối với mô hình AI chính tạm thời gián đoạn nên Agent dự phòng của MORI đã lọc nhanh ${suggestedCards.length} mẫu phù hợp${actions.length ? ' và chuẩn bị sẵn nút thao tác nhanh ngay bên dưới' : ''}. Bạn có thể bấm thử trực tiếp hoặc liên hệ nhân viên tư vấn nếu cần thiết kế riêng.`

  return {
    reply: deps.guardrail.sanitizeArtisanReply(reply),
    updatedBrief: brief,
    suggestedProducts: suggestedCards,
    estimatedBudget,
    quickFollowUps: buildSmartFollowUps({
      inlineFollowUps: [],
      actions,
      brief,
      history: req.history ?? [],
      lastUserMessage: req.message,
      hasUserPhoto: Boolean(req.attachments?.length),
    }),
    toolTraces: traces,
    proposedActions: actions,
    meta: { modelUsed: 'fallback/agent-offline', fallbackTier: 4, latencyMs, groundedProductCount: catalog.length },
  }
}
