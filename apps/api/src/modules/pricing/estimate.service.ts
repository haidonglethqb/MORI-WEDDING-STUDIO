import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { estimatePrice } from '@mori/domain'
import type { EstimateRequest, EstimateResponse } from '@mori/contracts'

const EMPTY: Omit<EstimateResponse, 'currency' | 'quantity' | 'quoteRequired'> = {
  merchandiseVnd: null,
  shippingVnd: null,
  taxVnd: null,
  totalVnd: null,
  unresolved: ['shipping', 'tax'],
}

@Injectable()
export class EstimateService {
  async estimate(input: EstimateRequest): Promise<EstimateResponse> {
    const prisma = getPrismaClient()
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    })
    if (!variant || variant.product.state !== 'ACTIVE') throw new NotFoundException()
    if (variant.shape === 'TRIFOLD' || variant.availability === 'UNAVAILABLE') {
      throw new BadRequestException('This configuration cannot be estimated')
    }
    if (variant.availability === 'QUOTE_REQUIRED') {
      return { currency: 'VND', quantity: input.quantity, quoteRequired: true, ...EMPTY }
    }

    const rules = await prisma.priceRule.findMany({
      where: { variantId: variant.id, priceBook: { state: 'PUBLISHED' } },
    })
    const priced = estimatePrice({
      quantity: input.quantity,
      tiers: rules.map((rule) => ({
        quantityMin: rule.quantityMin,
        quantityMax: rule.quantityMax,
        unitAmountVnd: rule.unitAmountVnd,
        setupAmountVnd: rule.setupAmountVnd,
      })),
      shippingVnd: null,
      taxVnd: null,
    })
    return { currency: 'VND', quoteRequired: false, ...priced }
  }
}
