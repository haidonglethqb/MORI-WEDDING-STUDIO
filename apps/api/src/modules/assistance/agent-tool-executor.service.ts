import { Injectable, Optional } from '@nestjs/common'
import { StorefrontOrderService } from '../orders/storefront-order.service.js'
import {
  executeProposeCart,
  executeProposeCustomRequest,
  executeProposeDigitalDraft,
  executeSearchCatalog,
  executeUpdateBrief,
  formatVnd,
  readStr,
  type ProposalToolOutcome,
} from './agent-action-proposals.js'
import { executeGenerateBespokeInvitation } from './agent-bespoke-builder.js'
import { searchDesignSystem } from './agent-design-systems.js'
import { searchMotionArtworkKits } from './agent-motion-kits.js'
import { DIGITAL_AGENT_CATALOG, type AgentAttachment, type AgentToolName } from './agent-types.js'
import { AiPricingTool } from './ai-pricing-tool.js'
import type { CatalogProductItem, EstimatedBudgetSummary } from './assistant-types.js'

export interface ToolExecutionOutcome extends ProposalToolOutcome {
  estimatedBudget?: EstimatedBudgetSummary
}

@Injectable()
export class AgentToolExecutorService {
  constructor(
    @Optional() private readonly pricingTool?: AiPricingTool,
    @Optional() private readonly orderService?: StorefrontOrderService,
  ) {}

  async execute(
    name: AgentToolName,
    args: Record<string, unknown>,
    catalog: CatalogProductItem[],
    attachments?: AgentAttachment[],
  ): Promise<ToolExecutionOutcome> {
    if (name === 'search_catalog') return executeSearchCatalog(args, catalog)
    if (name === 'calculate_quote') return this.runCalculateQuote(args, catalog)
    if (name === 'track_order') return this.runTrackOrder(args)
    if (name === 'propose_add_to_cart') return executeProposeCart(args, catalog)
    if (name === 'propose_create_digital_invitation') return executeProposeDigitalDraft(args)
    if (name === 'get_design_system') {
      const sys = searchDesignSystem(readStr(args, 'query'), readStr(args, 'mood'))
      return {
        summary: `Áp dụng hệ thiết kế ${sys.name}`,
        output: {
          designSystemId: sys.id,
          name: sys.name,
          typography: sys.typography,
          frameStyle: sys.frameStyle,
          bgPattern: sys.bgPattern,
          ornament: sys.ornament,
          heroLayout: sys.heroLayout,
          theme: sys.theme,
          fontStack: sys.fontStack,
          cssRecipe: sys.cssRecipe,
          antiPatterns: sys.antiPatterns,
        },
      }
    }
    if (name === 'get_motion_artwork_kit') {
      const kits = searchMotionArtworkKits(readStr(args, 'motif'))
      return {
        summary: `Đã nạp ${kits.map((k) => k.id).join(' + ')}`,
        output: {
          kits: kits.map((k) => ({
            id: k.id,
            name: k.name,
            usageNote: k.usageNote,
            htmlSnippet: k.htmlSnippet,
            cssSnippet: k.cssSnippet,
          })),
        },
      }
    }
    if (name === 'generate_bespoke_invitation') return executeGenerateBespokeInvitation(args, attachments)
    if (name === 'propose_custom_request') return executeProposeCustomRequest(args)
    return executeUpdateBrief(args)
  }

  private async runCalculateQuote(args: Record<string, unknown>, catalog: CatalogProductItem[]): Promise<ToolExecutionOutcome> {
    const paperSlug = typeof args['paperSlug'] === 'string' ? args['paperSlug'] : ''
    const digitalSlug = typeof args['digitalSlug'] === 'string' ? args['digitalSlug'] : ''
    const rawQty = Number(args['quantity'] ?? 100)
    const quantity = Number.isFinite(rawQty) && rawQty >= 10 ? Math.min(2000, Math.round(rawQty)) : 100
    const reqShape = typeof args['shape'] === 'string' ? args['shape'].toUpperCase() : undefined

    const paperItem = paperSlug ? catalog.find((c) => c.slug === paperSlug) : undefined
    const digitalItem = digitalSlug ? DIGITAL_AGENT_CATALOG.find((d) => d.slug === digitalSlug) : undefined

    let paperTotalVnd = 0n
    let paperQuoteRequired = false
    if (paperItem) {
      if (this.pricingTool && !paperItem.isFixture) {
        const est = await this.pricingTool.lookupVariantAndEstimate({ productSlug: paperItem.slug, shape: reqShape ?? paperItem.shape, quantity })
        if (est.success && est.merchandiseVnd) paperTotalVnd = BigInt(est.merchandiseVnd)
        else paperQuoteRequired = true
      } else if (paperItem.unitPriceVnd > 0n) {
        paperTotalVnd = paperItem.unitPriceVnd * BigInt(quantity)
      } else {
        paperQuoteRequired = true
      }
    }

    const digitalFull = digitalItem?.unitAmountVnd ?? 0n
    const digitalDiscounted = paperItem && digitalItem ? digitalFull / 2n : digitalFull
    const grandTotal = paperTotalVnd + digitalDiscounted
    const budget: EstimatedBudgetSummary | undefined = paperItem && paperTotalVnd > 0n ? {
      quantity,
      shape: paperItem.shape === 'BIFOLD' ? 'BIFOLD' : 'FLAT',
      baseAmountVnd: formatVnd(paperTotalVnd),
      finishesAmountVnd: digitalItem ? `${formatVnd(digitalDiscounted)} (Thiệp Online -50%)` : '0 ₫',
      totalAmountVnd: formatVnd(grandTotal),
      giftComplimentary: digitalItem ? `Đã giảm 50% gói ${digitalItem.name}` : '',
    } : undefined

    return {
      summary: grandTotal > 0n ? `Dự toán ${formatVnd(grandTotal)}` : 'Cần xưởng báo giá riêng',
      ...(paperItem ? { suggestedSlugs: [paperItem.slug] } : {}),
      ...(budget ? { estimatedBudget: budget } : {}),
      output: {
        quantity,
        paperSlug: paperItem?.slug ?? null,
        paperTotalVnd: paperQuoteRequired ? 'Cần báo giá riêng' : formatVnd(paperTotalVnd),
        digitalSlug: digitalItem?.slug ?? null,
        digitalPriceVnd: digitalItem ? formatVnd(digitalDiscounted) : null,
        comboDiscountApplied: Boolean(paperItem && digitalItem),
        totalVnd: paperQuoteRequired ? 'Liên hệ báo giá' : formatVnd(grandTotal),
      },
    }
  }

  private runTrackOrder(args: Record<string, unknown>): ToolExecutionOutcome {
    const code = readStr(args, 'code')
    const contact = readStr(args, 'contact')
    if (!this.orderService) {
      return { summary: 'Chưa kết nối kho đơn hàng', output: { found: false, message: 'Dịch vụ tra cứu đơn hàng chưa sẵn sàng.' } }
    }
    try {
      const res = this.orderService.trackOrder(code, contact)
      const paperStep = res.order.paperStepIndex !== null ? res.paperSteps[res.order.paperStepIndex] : null
      const onlineStep = res.order.onlineStepIndex !== null ? res.onlineSteps[res.order.onlineStepIndex] : null
      return {
        summary: `Đơn ${res.order.code}: ${res.order.paymentStatus}`,
        output: {
          found: true,
          code: res.order.code,
          orderType: res.order.orderType,
          summary: res.order.summary,
          paymentStatus: res.order.paymentStatus,
          totalAmountVnd: formatVnd(BigInt(res.order.totalAmountVnd)),
          remainingAmountVnd: formatVnd(BigInt(res.order.remainingAmountVnd)),
          paperStage: paperStep ?? null,
          onlineStage: onlineStep ?? null,
        },
      }
    } catch (err) {
      return {
        summary: `Không tìm thấy đơn ${code || '(trống)'}`,
        output: { found: false, message: err instanceof Error ? err.message : 'Không tìm thấy đơn hàng phù hợp.' },
      }
    }
  }
}
