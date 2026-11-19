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
    const res = await deps.executor.execute('track_order', { code: orderMatch[0], contact: phoneOrEmailMatch[1] }, catalog)
    const done: AgentToolTraceItem = { ...trace, status: 'done', summary: res.summary, durationMs: Date.now() - tStart }
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

  const wantsDigitalDraft = /tạo thiệp|thiệp online|website cưới|mẫu thiệp số/i.test(text)
  if (wantsDigitalDraft) {
    const names = (brief.coupleNames ?? 'Quốc Bảo & Minh Anh').split(/\s*[&và-]\s*/i)
    const groomName = names[0]?.trim() || 'Quốc Bảo'
    const brideName = names[1]?.trim() || 'Minh Anh'
    const templateId = /song hỷ|truyền thống|á đông|đỏ/i.test(text)
      ? 'heritage-palace'
      : /thảo mộc|hoa|tối giản|wabi|zen/i.test(text)
        ? 'botanical-zen'
        : 'editorial-vogue'
    const res = await deps.executor.execute('propose_create_digital_invitation', { templateId, groomName, brideName, venueName: brief.location ?? undefined }, catalog)
    if (res.action) actions.push(res.action)
    traces.push({ id: 'fb-draft', tool: 'propose_create_digital_invitation', label: 'Chuẩn bị bản nháp Thiệp Online', status: 'done', summary: res.summary, durationMs: 2 })
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
    quickFollowUps: ['Tạo thiệp cưới online cho hai bạn', 'Gợi ý combo giấy & online giảm 50%', 'Tra cứu đơn hàng MORI'],
    toolTraces: traces,
    proposedActions: actions,
    meta: { modelUsed: 'fallback/agent-offline', fallbackTier: 4, latencyMs, groundedProductCount: catalog.length },
  }
}
