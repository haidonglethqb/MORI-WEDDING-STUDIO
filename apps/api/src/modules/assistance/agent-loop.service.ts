import { Injectable } from '@nestjs/common'
import { runAgentDeterministicFallback } from './agent-fallback.js'
import { buildSmartFollowUps, extractInlineFollowUps } from './agent-followups.js'
import { buildAgentInitialMessages } from './agent-prompts.js'
import { AgentToolExecutorService } from './agent-tool-executor.service.js'
import { AGENT_TOOLS } from './agent-tool-registry.js'
import type { AgentProposedAction, AgentStreamEvent, AgentToolName, AgentToolTraceItem, LlmToolMessage } from './agent-types.js'
import type { AssistantChatRequest, AssistantChatResponse, CatalogProductItem, ConversationWeddingBrief, EstimatedBudgetSummary } from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

const MAX_STEPS = 4

const TOOL_LABELS: Record<AgentToolName, string> = {
  search_catalog: 'Tìm mẫu thiệp trong kho dữ liệu',
  calculate_quote: 'Tính báo giá & ưu đãi Combo',
  track_order: 'Tra cứu trạng thái đơn hàng',
  propose_add_to_cart: 'Chuẩn bị nút thêm giỏ hàng',
  propose_create_digital_invitation: 'Chuẩn bị bản nháp Thiệp Online',
  generate_bespoke_invitation: 'Thiết kế mẫu Thiệp Online độc bản',
  propose_custom_request: 'Soạn phiếu Thiết kế riêng',
  update_wedding_brief: 'Cập nhật hồ sơ tiệc cưới',
}

function parseToolArgs(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw || '{}')
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function isAgentToolName(val: string): val is AgentToolName {
  return val in TOOL_LABELS
}

@Injectable()
export class AgentLoopService {
  constructor(
    private readonly gateway: GroqAiGateway,
    private readonly executor: AgentToolExecutorService,
    private readonly extractor: ContextExtractor,
    private readonly matcher: ScoringMatcher,
    private readonly guardrail: SupervisorGuardrail,
  ) {}

  async run(
    req: AssistantChatRequest,
    catalog: CatalogProductItem[],
    baseBrief: ConversationWeddingBrief,
    onEvent?: (ev: AgentStreamEvent) => void,
  ): Promise<AssistantChatResponse> {
    const start = Date.now()
    onEvent?.({ type: 'status', message: 'MORI Agent đang phân tích yêu cầu...' })
    const messages: LlmToolMessage[] = buildAgentInitialMessages(
      baseBrief,
      req.history ?? [],
      req.message,
      req.liveContext,
      req.attachments,
    )

    let brief = { ...baseBrief }
    const traces: AgentToolTraceItem[] = []
    const actions: AgentProposedAction[] = []
    const suggestedSlugs: string[] = []
    let estimatedBudget: EstimatedBudgetSummary | null = null
    let modelUsed = 'agent/unknown'
    let fallbackTier = 1
    let finalReply = ''

    try {
      for (let step = 0; step < MAX_STEPS; step++) {
        const res = await this.gateway.executeToolStep(messages, AGENT_TOOLS)
        modelUsed = res.modelUsed
        fallbackTier = res.fallbackTier
        if (res.toolCalls.length === 0) {
          finalReply = res.content.trim()
          break
        }

        messages.push({ role: 'assistant', content: res.content || null, tool_calls: res.toolCalls })

        for (const call of res.toolCalls) {
          const toolName = call.function.name
          if (!isAgentToolName(toolName)) continue
          const traceId = call.id || `trace-${step}-${traces.length}`
          const runningTrace: AgentToolTraceItem = { id: traceId, tool: toolName, label: TOOL_LABELS[toolName], status: 'running' }
          onEvent?.({ type: 'tool_start', trace: runningTrace })

          const t0 = Date.now()
          const parsedArgs = parseToolArgs(call.function.arguments)
          const outcome = await this.executor.execute(toolName, parsedArgs, catalog, req.attachments)
          const doneTrace: AgentToolTraceItem = {
            ...runningTrace,
            status: 'done',
            summary: outcome.summary,
            durationMs: Date.now() - t0,
            input: parsedArgs,
            output: outcome.output,
          }
          traces.push(doneTrace)
          onEvent?.({ type: 'tool_done', trace: doneTrace })

          if (outcome.action) actions.push(outcome.action)
          if (outcome.suggestedSlugs) suggestedSlugs.push(...outcome.suggestedSlugs)
          if (outcome.estimatedBudget) estimatedBudget = outcome.estimatedBudget
          if (outcome.briefPatch) brief = this.extractor.mergeBrief(brief, outcome.briefPatch)

          messages.push({ role: 'tool', tool_call_id: call.id, name: toolName, content: JSON.stringify(outcome.output) })
        }
      }

      if (!finalReply) {
        onEvent?.({ type: 'status', message: 'Đang tổng hợp phản hồi cho bạn...' })
        const closing = await this.gateway.executeToolStep(messages, [])
        modelUsed = closing.modelUsed
        fallbackTier = closing.fallbackTier
        finalReply = closing.content.trim()
      }

      const { reply: replyNoTag, inlineFollowUps } = extractInlineFollowUps(finalReply)
      const sanitized = this.guardrail.sanitizeArtisanReply(replyNoTag)
      this.emitProgressiveText(sanitized, onEvent)
      const uniqueSlugs = [...new Set(suggestedSlugs)]
      const matched = uniqueSlugs.length > 0 ? this.matcher.rankProducts(catalog, brief, uniqueSlugs) : []
      const hasUserPhoto = Boolean(req.attachments?.length || req.liveContext?.activeBespokeDesign?.hasUserPhoto)

      return {
        reply: sanitized,
        updatedBrief: brief,
        suggestedProducts: this.guardrail.buildProductCards(matched),
        estimatedBudget,
        quickFollowUps: buildSmartFollowUps({
          inlineFollowUps,
          actions,
          brief,
          history: req.history ?? [],
          lastUserMessage: req.message,
          hasUserPhoto,
        }),
        toolTraces: traces,
        proposedActions: actions,
        meta: { modelUsed, fallbackTier, latencyMs: Date.now() - start, groundedProductCount: catalog.length },
      }
    } catch {
      const fb = await runAgentDeterministicFallback(
        req,
        catalog,
        brief,
        Date.now() - start,
        { executor: this.executor, matcher: this.matcher, guardrail: this.guardrail },
        onEvent,
      )
      this.emitProgressiveText(fb.reply, onEvent)
      return fb
    }
  }

  private emitProgressiveText(text: string, onEvent?: (ev: AgentStreamEvent) => void): void {
    if (!onEvent || !text) return
    let buf = ''
    for (const token of text.split(/(\s+)/)) {
      buf += token
      if (buf.length >= 24) {
        onEvent({ type: 'delta', text: buf })
        buf = ''
      }
    }
    if (buf) onEvent({ type: 'delta', text: buf })
  }
}
