import { formatVnd } from './money.js'

export const MAX_QUANTITY = 10_000

export interface PriceTier {
  quantityMin: number
  quantityMax: number
  unitAmountVnd: bigint
  setupAmountVnd: bigint
}

export interface PriceEstimate {
  quantity: number
  merchandiseVnd: string
  shippingVnd: string | null
  taxVnd: string | null
  totalVnd: string | null
  unresolved: string[]
}

export function estimatePrice(input: {
  quantity: number
  tiers: PriceTier[]
  shippingVnd: bigint | null
  taxVnd: bigint | null
}): PriceEstimate {
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_QUANTITY) {
    throw new Error('Quantity must be an integer from 1 to 10000')
  }
  const matches = input.tiers.filter(
    (tier) => input.quantity >= tier.quantityMin && input.quantity <= tier.quantityMax,
  )
  if (matches.length !== 1) {
    throw new Error('Quantity does not match exactly one price tier')
  }
  const tier = matches[0]
  if (!tier) throw new Error('Quantity does not match exactly one price tier')
  const merchandise = tier.unitAmountVnd * BigInt(input.quantity) + tier.setupAmountVnd
  const unresolved: string[] = []
  if (input.shippingVnd === null) unresolved.push('shipping')
  if (input.taxVnd === null) unresolved.push('tax')
  const total =
    unresolved.length === 0 && input.shippingVnd !== null && input.taxVnd !== null
      ? merchandise + input.shippingVnd + input.taxVnd
      : null
  return {
    quantity: input.quantity,
    merchandiseVnd: formatVnd(merchandise),
    shippingVnd: input.shippingVnd === null ? null : formatVnd(input.shippingVnd),
    taxVnd: input.taxVnd === null ? null : formatVnd(input.taxVnd),
    totalVnd: total === null ? null : formatVnd(total),
    unresolved,
  }
}
