import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  ConversationWeddingBrief,
  SuggestedProductCard,
} from './assistant-types.js'
import { ContextExtractor } from './context-extractor.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import {
  ATELIER_MASTER_SYSTEM_PROMPT,
  buildUserPrompt,
  formatGroundedCatalog,
} from './assistant-prompts.js'
import { RecommendationService } from './recommendation.service.js'

interface ModelRawOutput {
  reply: string
  updatedBrief?: Partial<ConversationWeddingBrief>
  suggestedSlugs?: string[]
  estimatedBudget?: AssistantChatResponse['estimatedBudget']
  quickFollowUps?: string[]
}

const BANNED_TERMS = ['chuyển khoản', 'đặt cọc', 'số tài khoản', 'thanh toán online', 'stk']

@Injectable()
export class AssistantOrchestratorService {
  constructor(
    private readonly groqGateway: GroqAiGateway,
    private readonly extractor: ContextExtractor,
    private readonly localFallbackService: RecommendationService,
  ) {}

  async handleChat(req: AssistantChatRequest): Promise<AssistantChatResponse> {
    const start = Date.now()
    const baseBrief = this.extractor.mergeBrief(
      this.extractor.createInitialBrief(),
      req.context,
    )
    const boostedBrief = this.extractor.boostFromText(baseBrief, req.message)
    const history = req.history?.slice(-6) ?? []

    const products = await getPrismaClient().product.findMany({
      where: { state: 'ACTIVE' },
      include: {
        variants: {
          include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
        },
      },
    })

    const catalogItems = products.map((p) => {
      const v = p.variants[0]
      const price = v?.priceRules[0]?.unitAmountVnd?.toString() ?? '25000'
      return {
        slug: p.slug,
        name: p.name,
        shape: v?.shape ?? 'FLAT',
        styles: p.styleTags,
        priceVnd: Number(price).toLocaleString('vi-VN'),
      }
    })

    const catalogGrounding = formatGroundedCatalog(catalogItems)
    const systemPrompt = `${ATELIER_MASTER_SYSTEM_PROMPT}\n\n${catalogGrounding}`
    const userPrompt = buildUserPrompt(boostedBrief, history, req.message)

    try {
      const completion = await this.groqGateway.executeCompletion<ModelRawOutput>(
        systemPrompt,
        userPrompt,
      )
      return this.formatSuccessResponse(completion.data, boostedBrief, products, {
        modelUsed: completion.modelUsed,
        fallbackTier: completion.fallbackTier,
        latencyMs: completion.latencyMs,
      })
    } catch {
      return this.formatLocalFallback(boostedBrief, req.message, products, Date.now() - start)
    }
  }

  private formatSuccessResponse(
    raw: ModelRawOutput,
    currentBrief: ConversationWeddingBrief,
    products: Array<{ id: string; slug: string; name: string; variants: Array<{ shape: string; priceRules: Array<{ unitAmountVnd: bigint }> }> }>,
    meta: { modelUsed: string; fallbackTier: number; latencyMs: number },
  ): AssistantChatResponse {
    let sanitizedReply = raw.reply || 'MORI rất hân hạnh được đồng hành cùng bạn.'
    for (const term of BANNED_TERMS) {
      sanitizedReply = sanitizedReply.replaceAll(new RegExp(term, 'gi'), '[quy trình may đo proof]')
    }

    const updatedBrief = this.extractor.mergeBrief(currentBrief, raw.updatedBrief)
    const validSlugs = new Set(products.map((p) => p.slug))
    const chosenSlugs = (raw.suggestedSlugs ?? []).filter((s) => validSlugs.has(s)).slice(0, 3)

    const suggestedProducts = chosenSlugs.map((slug) => this.mapProductCard(slug, products))

    return {
      reply: sanitizedReply,
      updatedBrief,
      suggestedProducts,
      estimatedBudget: raw.estimatedBudget ?? null,
      quickFollowUps: raw.quickFollowUps?.slice(0, 3) ?? [
        'Dáng thiệp gập đôi hay dạng phẳng?',
        'Tư vấn chi phí theo số lượng khách',
        'Tìm hiểu giấy bã mía 350gsm',
      ],
      meta,
    }
  }

  private async formatLocalFallback(
    brief: ConversationWeddingBrief,
    message: string,
    products: Array<{ id: string; slug: string; name: string; variants: Array<{ shape: string; priceRules: Array<{ unitAmountVnd: bigint }> }> }>,
    latencyMs: number,
  ): Promise<AssistantChatResponse> {
    const local = await this.localFallbackService.recommend({
      productType: 'PAPER',
      shape: brief.targetShape === 'BIFOLD' ? 'BIFOLD' : 'FLAT',
      styles: brief.aestheticIdentity ? [brief.aestheticIdentity.toLowerCase()] : [],
      colours: [],
      quantity: brief.estimatedSuites ?? 50,
      budgetVnd: null,
      budgetBasis: 'TOTAL',
    })

    const suggestedProducts = local.results.slice(0, 2).map((r) => this.mapProductCard(r.slug, products))

    return {
      reply: `Chào bạn, Master Pierre-Minh và MORI Atelier đã tiếp nhận thông tin tiệc cưới của bạn: "${message}". MORI trân trọng gợi ý các thiết kế chế tác trên giấy bã mía hữu cơ 350gsm dày dặn, kết hợp ép kim nhiệt dập chìm 160°C tinh xảo dưới đây. Mọi bộ thiệp đều được tặng kèm trang thiệp số RSVP đồng bộ trị giá 1.200.000 ₫.`,
      updatedBrief: brief,
      suggestedProducts,
      estimatedBudget: null,
      quickFollowUps: ['Xem chi tiết 3D mẫu này', 'Tư vấn tiệc ngoài trời', 'Báo giá 100 bộ thiệp'],
      meta: {
        modelUsed: 'deterministic/local-mori-atelier',
        fallbackTier: 4,
        latencyMs,
      },
    }
  }

  private mapProductCard(
    slug: string,
    products: Array<{ id: string; slug: string; name: string; variants: Array<{ shape: string; priceRules: Array<{ unitAmountVnd: bigint }> }> }>,
  ): SuggestedProductCard {
    const prod = products.find((p) => p.slug === slug)
    const shape = prod?.variants[0]?.shape ?? 'FLAT'
    const price = prod?.variants[0]?.priceRules[0]?.unitAmountVnd?.toString() ?? '25000'
    return {
      slug,
      name: prod?.name ?? slug,
      title: prod?.name ?? slug,
      subtitle: 'Chế tác thủ công giấy bã mía 350gsm & ép kim nhiệt 160°C',
      shape,
      startingPriceVnd: Number(price).toLocaleString('vi-VN'),
    }
  }
}
