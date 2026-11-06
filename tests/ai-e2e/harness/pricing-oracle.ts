/**
 * Canonical pricing evaluation oracle matching @mori/domain and EstimateService.
 * Financial Invariant: BigInt VND, decimal string serialization, never float.
 */
import {
  type TestPriceRule,
  type TestProductVariant,
  TEST_CATALOGUE_FIXTURES,
} from './catalogue-fixtures.js'

export const MAX_QUANTITY = 10_000

export interface OracleEstimateResponse {
  currency: 'VND'
  quantity: number
  quoteRequired: boolean
  merchandiseVnd: string | null
  shippingVnd: string | null
  taxVnd: string | null
  totalVnd: string | null
  unresolved: string[]
}

export function computeOracleEstimate(input: {
  variantId: string
  quantity: number
}): OracleEstimateResponse {
  const { variantId, quantity } = input

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new Error('Quantity must be an integer from 1 to 10000')
  }

  // Find variant in catalogue fixtures
  let foundVariant: TestProductVariant | null = null
  let productActive = false

  for (const product of TEST_CATALOGUE_FIXTURES) {
    for (const v of product.variants) {
      if (v.id === variantId) {
        foundVariant = v
        productActive = product.state === 'ACTIVE'
        break
      }
    }
  }

  if (!foundVariant || !productActive) {
    throw new Error('NotFoundException: Variant or active product not found')
  }

  if (foundVariant.shape === 'TRIFOLD' || foundVariant.availability === 'UNAVAILABLE') {
    throw new Error('BadRequestException: This configuration cannot be estimated')
  }

  if (foundVariant.availability === 'QUOTE_REQUIRED') {
    return {
      currency: 'VND',
      quantity,
      quoteRequired: true,
      merchandiseVnd: null,
      shippingVnd: null,
      taxVnd: null,
      totalVnd: null,
      unresolved: ['shipping', 'tax'],
    }
  }

  // Match tiers
  const matches = foundVariant.priceRules.filter(
    (tier: TestPriceRule) => quantity >= tier.quantityMin && quantity <= tier.quantityMax,
  )

  if (matches.length !== 1) {
    throw new Error('BadRequestException: Quantity does not match exactly one price tier')
  }

  const tier = matches[0]
  if (!tier) throw new Error('Tier resolution failed')

  const merchandiseBig = tier.unitAmountVnd * BigInt(quantity) + tier.setupAmountVnd

  return {
    currency: 'VND',
    quantity,
    quoteRequired: false,
    merchandiseVnd: merchandiseBig.toString(),
    shippingVnd: null,
    taxVnd: null,
    totalVnd: null,
    unresolved: ['shipping', 'tax'],
  }
}
