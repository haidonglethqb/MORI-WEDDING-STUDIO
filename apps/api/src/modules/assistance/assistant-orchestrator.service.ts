import { Injectable } from '@nestjs/common'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  CatalogProductItem,
  ConversationWeddingBrief,
} from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { AiLogService } from './ai-log.service.js'
import {
  ATELIER_MASTER_SYSTEM_PROMPT,
  buildUserPrompt,
  formatGroundedCatalog,
} from './assistant-prompts.js'

interface ModelRawOutput {
  reply: string
  updatedBrief?: Partial<ConversationWeddingBrief>
  suggestedSlugs?: string[]
  quickFollowUps?: string[]
}

@Injectable()
export class AssistantOrchestratorService {
  private readonly logService: AiLogService

  constructor(
    private readonly groqGateway: GroqAiGateway,
    private readonly extractor: ContextExtractor,
    private readonly catalogProvider: CatalogProvider,
    private readonly matcher: ScoringMatcher,
    private readonly estimator: BespokeEstimator,
    private readonly guardrail: SupervisorGuardrail,
    logService?: AiLogService,
  ) {
    this.logService = logService ?? new AiLogService()
  }

  async handleChat(req: AssistantChatRequest, sessionId = 'session_guest_default'): Promise<AssistantChatResponse> {
    const start = Date.now()
    const baseBrief = this.extractor.mergeBrief(
      this.extractor.createInitialBrief(),
      req.context,
    )
    const boostedBrief = this.extractor.boostFromText(baseBrief, req.message)
    const history = req.history?.slice(-30) ?? []
    const catalog = await this.catalogProvider.getActiveProducts()

    const catalogGrounding = formatGroundedCatalog(catalog)
    const systemPrompt = `${ATELIER_MASTER_SYSTEM_PROMPT}\n\n${catalogGrounding}`
    const userPrompt = buildUserPrompt(boostedBrief, history, req.message)

    let response: AssistantChatResponse
    try {
      const completion = await this.groqGateway.executeCompletion<ModelRawOutput>(
        systemPrompt,
        userPrompt,
      )
      response = this.formatSuccessResponse(completion.data, boostedBrief, catalog, {
        modelUsed: completion.modelUsed,
        fallbackTier: completion.fallbackTier,
        latencyMs: completion.latencyMs,
        groundedProductCount: catalog.length,
      })
    } catch {
      response = this.formatLocalFallback(boostedBrief, req.message, catalog, Date.now() - start)
    }

    this.logService.recordTurn(
      sessionId,
      {
        userMessage: req.message,
        modelUsed: response.meta.modelUsed,
        fallbackTier: response.meta.fallbackTier,
        latencyMs: response.meta.latencyMs,
        assistantReply: response.reply,
        suggestedProducts: response.suggestedProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          startingPriceVnd: p.startingPriceVnd,
        })),
      },
      {
        coupleNames: response.updatedBrief.coupleNames,
        weddingDate: response.updatedBrief.weddingDate,
        location: response.updatedBrief.location,
        guestCount: response.updatedBrief.guestCount,
        budget: response.updatedBrief.budgetRangeVnd?.max ?? null,
        aesthetic: response.updatedBrief.aestheticIdentity,
        targetShape: response.updatedBrief.targetShape,
      },
    )

    return response
  }

  private formatSuccessResponse(
    raw: ModelRawOutput,
    currentBrief: ConversationWeddingBrief,
    catalog: CatalogProductItem[],
    meta: { modelUsed: string; fallbackTier: number; latencyMs: number; groundedProductCount: number },
  ): AssistantChatResponse {
    const sanitizedReply = this.guardrail.sanitizeArtisanReply(raw.reply)
    const updatedBrief = this.extractor.mergeBrief(currentBrief, raw.updatedBrief)

    const mentionedFromReply: { slug: string; index: number }[] = []
    const lowerReply = sanitizedReply.toLowerCase()
    for (const item of catalog) {
      const idx = lowerReply.indexOf(item.name.toLowerCase())
      if (idx !== -1) {
        mentionedFromReply.push({ slug: item.slug, index: idx })
      }
    }
    mentionedFromReply.sort((a, b) => a.index - b.index)

    const effectiveSlugs =
      mentionedFromReply.length > 0
        ? mentionedFromReply.map((m) => m.slug)
        : (raw.suggestedSlugs ?? [])

    const matchedProducts = this.matcher.rankProducts(catalog, updatedBrief, effectiveSlugs)
    const suggestedCards = this.guardrail.buildProductCards(matchedProducts)
    const estimatedBudget = this.estimator.calculateBudget(updatedBrief)

    return {
      reply: sanitizedReply,
      updatedBrief,
      suggestedProducts: suggestedCards,
      estimatedBudget,
      quickFollowUps: raw.quickFollowUps?.slice(0, 3) ?? [
        'Dáng thiệp gập đôi hay phẳng?',
        'Tư vấn chi phí theo số lượng khách',
        'Tìm hiểu giấy bã mía 350gsm',
      ],
      meta,
    }
  }

  private formatLocalFallback(
    brief: ConversationWeddingBrief,
    message: string,
    catalog: CatalogProductItem[],
    latencyMs: number,
  ): AssistantChatResponse {
    const matched = this.matcher.rankProducts(catalog, brief)
    const suggestedCards = this.guardrail.buildProductCards(matched)
    const estimatedBudget = this.estimator.calculateBudget(brief)

    const coupleGreeting = brief.coupleNames ? `Chào ${brief.coupleNames}, ` : 'Kính chào bạn, '
    const venueNote = brief.venueCategory === 'OUTDOOR_GARDEN' ? 'sân vườn gần gũi thiên nhiên' : 'ngày trọng đại'

    return {
      reply: `${coupleGreeting}Master Pierre-Minh & Vũ Cầm từ MORI Atelier đã tiếp nhận chia sẻ: "${message}". Để hoàn hảo cho ${venueNote}, chúng mình trân trọng gợi ý các thiết kế chế tác trên giấy bã mía hữu cơ 350gsm ngà tự nhiên, ép kim nhiệt 160°C hoặc mép xé thủ công dưới đây. Mọi bộ thiệp đều được tặng kèm trang thiệp cưới số RSVP trị giá 1.200.000 ₫.`,
      updatedBrief: brief,
      suggestedProducts: suggestedCards,
      estimatedBudget,
      quickFollowUps: ['Xem chi tiết 3D mẫu này', 'Tư vấn tiệc ngoài trời', 'Báo giá 100 bộ thiệp'],
      meta: {
        modelUsed: 'deterministic/local-mori-atelier',
        fallbackTier: 4,
        latencyMs,
        groundedProductCount: catalog.length,
      },
    }
  }
}
