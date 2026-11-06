import { Injectable } from '@nestjs/common'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  CatalogProductItem,
  ConversationWeddingBrief,
  EstimatedBudgetSummary,
} from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { AiLogService } from './ai-log.service.js'
import { AiPricingTool } from './ai-pricing-tool.js'
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
    private readonly pricingTool?: AiPricingTool,
    logService?: AiLogService,
  ) {
    this.logService = logService ?? new AiLogService()
  }

  async handleChat(req: AssistantChatRequest, sessionId = 'session_guest_default'): Promise<AssistantChatResponse> {
    const start = Date.now()
    const baseBrief = this.extractor.mergeBrief(this.extractor.createInitialBrief(), req.context)
    const boostedBrief = this.extractor.boostFromText(baseBrief, req.message)
    const history = req.history?.slice(-30) ?? []
    const catalog = await this.catalogProvider.getActiveProducts()

    const catalogGrounding = formatGroundedCatalog(catalog)
    const systemPrompt = `${ATELIER_MASTER_SYSTEM_PROMPT}\n\n${catalogGrounding}`
    const userPrompt = buildUserPrompt(boostedBrief, history, req.message)

    let response: AssistantChatResponse
    try {
      const completion = await this.groqGateway.executeCompletion<ModelRawOutput>(systemPrompt, userPrompt)
      response = await this.formatSuccessResponse(completion.data, boostedBrief, catalog, {
        modelUsed: completion.modelUsed,
        fallbackTier: completion.fallbackTier,
        latencyMs: completion.latencyMs,
        groundedProductCount: catalog.length,
      })
    } catch {
      response = this.formatLocalFallback(boostedBrief, catalog, Date.now() - start)
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

  private async formatSuccessResponse(
    raw: ModelRawOutput,
    currentBrief: ConversationWeddingBrief,
    catalog: CatalogProductItem[],
    meta: { modelUsed: string; fallbackTier: number; latencyMs: number; groundedProductCount: number },
  ): Promise<AssistantChatResponse> {
    const sanitizedReply = this.guardrail.sanitizeArtisanReply(raw.reply)
    const updatedBrief = this.extractor.mergeBrief(currentBrief, raw.updatedBrief)

    const mentionedFromReply: { slug: string; index: number }[] = []
    const lowerReply = sanitizedReply.toLowerCase()
    for (const item of catalog) {
      const idx = lowerReply.indexOf(item.name.toLowerCase())
      if (idx !== -1) mentionedFromReply.push({ slug: item.slug, index: idx })
    }
    mentionedFromReply.sort((a, b) => a.index - b.index)

    const effectiveSlugs = mentionedFromReply.length > 0
      ? mentionedFromReply.map((m) => m.slug)
      : (raw.suggestedSlugs ?? [])

    const matchedProducts = this.matcher.rankProducts(catalog, updatedBrief, effectiveSlugs)
    const suggestedCards = this.guardrail.buildProductCards(matchedProducts)

    // Ground card prices and budget via EstimateService / AiPricingTool (T28)
    let estimatedBudget: EstimatedBudgetSummary | null = null
    const suites = updatedBrief.estimatedSuites
    const pricedProducts = matchedProducts.filter((product) => !product.isFixture)
    if (this.pricingTool && suites && suites >= 10 && pricedProducts.length > 0) {
      for (const card of suggestedCards.filter((product) => !product.isFixture)) {
        const est = await this.pricingTool.lookupVariantAndEstimate({ productSlug: card.slug, shape: card.shape, quantity: suites })
        if (est.success && est.merchandiseVnd) card.startingPriceVnd = est.merchandiseVnd
      }
      const primary = pricedProducts[0]
      if (primary) {
        const primaryEst = await this.pricingTool.lookupVariantAndEstimate({ productSlug: primary.slug, shape: primary.shape, quantity: suites })
        if (primaryEst.success && primaryEst.merchandiseVnd) {
          estimatedBudget = {
            quantity: suites,
            shape: primary.shape === 'BIFOLD' ? 'BIFOLD' : 'FLAT',
            baseAmountVnd: primaryEst.merchandiseVnd,
            finishesAmountVnd: '0 ₫',
            totalAmountVnd: primaryEst.merchandiseVnd,
            giftComplimentary: '',
          }
        }
      }
    }

    return {
      reply: sanitizedReply,
      updatedBrief,
      suggestedProducts: suggestedCards,
      estimatedBudget,
      quickFollowUps: raw.quickFollowUps?.slice(0, 3) ?? ['Bạn thích thiệp gấp đôi hay phẳng?', 'Tư vấn theo số lượng khách', 'Tìm hiểu các lựa chọn chất liệu'],
      meta,
    }
  }

  private formatLocalFallback(
    brief: ConversationWeddingBrief,
    catalog: CatalogProductItem[],
    latencyMs: number,
  ): AssistantChatResponse {
    const matched = this.matcher.rankProducts(catalog, brief)
    const suggestedCards = this.guardrail.buildProductCards(matched)
    const coupleGreeting = brief.coupleNames ? `Chào ${brief.coupleNames}, ` : 'Kính chào bạn, '
    const venueNote = brief.venueCategory === 'OUTDOOR_GARDEN' ? 'không gian tiệc ngoài trời' : 'ngày cưới trọng đại'

    return {
      reply: `${coupleGreeting}kết nối trực tiếp với trợ lý AI tạm thời gián đoạn hoặc phản hồi chậm. MORI Atelier xin gửi gợi ý các thiết kế tiêu chuẩn phù hợp cho ${venueNote} để bạn tham khảo. Bạn cũng có thể liên hệ trực tiếp xưởng may đo để nhận bảng giá chính xác.`,
      updatedBrief: brief,
      suggestedProducts: suggestedCards,
      estimatedBudget: null,
      quickFollowUps: ['Xem chi tiết mẫu này', 'Tư vấn tiệc ngoài trời', 'Báo giá 100 bộ thiệp'],
      meta: { modelUsed: 'fallback/catalog-offline', fallbackTier: 4, latencyMs, groundedProductCount: catalog.length },
    }
  }
}
