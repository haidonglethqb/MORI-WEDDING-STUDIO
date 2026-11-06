import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { EstimateService } from '../pricing/estimate.service.js'
import type { EstimateResponse } from '@mori/contracts'

export interface PricingToolResult {
  success: boolean
  currency?: 'VND'
  quantity?: number
  quoteRequired: boolean
  merchandiseVnd: string | null
  shippingVnd: string | null
  taxVnd: string | null
  totalVnd: string | null
  unresolved: string[]
  isAvailable?: boolean
  status?: 'OK' | 'QUOTE_REQUIRED' | 'UNAVAILABLE' | 'NOT_FOUND' | 'TIER_MISMATCH' | 'ERROR'
  message?: string
}

const EMPTY_UNRESOLVED = ['shipping', 'tax']

@Injectable()
export class AiPricingTool {
  constructor(private readonly estimateService: EstimateService) {}

  async calculateEstimate(input: {
    variantId: string
    quantity: number
  }): Promise<PricingToolResult> {
    try {
      const res: EstimateResponse = await this.estimateService.estimate(input)
      return {
        success: true,
        currency: res.currency,
        quantity: res.quantity,
        quoteRequired: res.quoteRequired,
        merchandiseVnd: res.merchandiseVnd,
        shippingVnd: res.shippingVnd,
        taxVnd: res.taxVnd,
        totalVnd: res.totalVnd,
        unresolved: res.unresolved,
        isAvailable: true,
        status: res.quoteRequired ? 'QUOTE_REQUIRED' : 'OK',
      }
    } catch (err) {
      const isBadReq = err instanceof BadRequestException
      const isNotFound = err instanceof NotFoundException
      return {
        success: false,
        status: isBadReq ? 'UNAVAILABLE' : isNotFound ? 'NOT_FOUND' : 'TIER_MISMATCH',
        quoteRequired: true,
        isAvailable: !isBadReq,
        merchandiseVnd: null,
        shippingVnd: null,
        taxVnd: null,
        totalVnd: null,
        unresolved: EMPTY_UNRESOLVED,
        message: err instanceof Error ? err.message : 'Lỗi tính giá',
      }
    }
  }

  async lookupVariantAndEstimate(input: {
    productSlug: string
    shape?: string
    quantity: number
  }): Promise<PricingToolResult> {
    const product = await getPrismaClient().product.findUnique({
      where: { slug: input.productSlug },
      include: { variants: true },
    })
    if (!product || product.state !== 'ACTIVE') {
      return {
        success: false,
        status: 'NOT_FOUND',
        quoteRequired: true,
        merchandiseVnd: null,
        shippingVnd: null,
        taxVnd: null,
        totalVnd: null,
        unresolved: EMPTY_UNRESOLVED,
        message: 'Mẫu sản phẩm không tồn tại trong hệ thống',
      }
    }

    const targetShape = input.shape?.toUpperCase()
    const variant =
      product.variants.find((v) => targetShape && v.shape === targetShape) ??
      product.variants.find((v) => v.shape !== 'TRIFOLD' && v.availability !== 'UNAVAILABLE') ??
      product.variants[0]

    if (!variant) {
      return {
        success: false,
        status: 'NOT_FOUND',
        quoteRequired: true,
        merchandiseVnd: null,
        shippingVnd: null,
        taxVnd: null,
        totalVnd: null,
        unresolved: EMPTY_UNRESOLVED,
        message: 'Không tìm thấy cấu hình phù hợp',
      }
    }

    return this.calculateEstimate({ variantId: variant.id, quantity: input.quantity })
  }
}
