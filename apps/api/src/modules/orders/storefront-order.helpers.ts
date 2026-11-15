import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { CATALOGUE_PRODUCTS } from '../catalogue/catalogue-data.js'
import type { StorefrontOrder, StorefrontOrderItem, StorefrontOrderItemInput } from './storefront-order.types.js'

const CATALOG_BY_SLUG = new Map(CATALOGUE_PRODUCTS.map((p) => [p.slug, p]))
const DIGITAL_BY_STYLE = new Map(
  CATALOGUE_PRODUCTS.filter((p) => p.type === 'DIGITAL').map((p) => [p.slug.split('-')[0] ?? '', p]),
)

export function parseVnd(raw: string | number | undefined): bigint {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return BigInt(Math.trunc(raw))
  const digits = String(raw ?? '0').replace(/[^\d]/g, '')
  return digits ? BigInt(digits) : 0n
}

export function nextSequentialCode(prefix: string, existingCodes: string[]): string {
  let maxNum = 0
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i')
  for (const c of existingCodes) {
    const match = c.match(regex)
    if (match?.[1]) {
      const num = Number.parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(4, '0')}`
}

export function priceOrderItems(inputs: StorefrontOrderItemInput[]) {
  const hasPaper = inputs.some((i) => i.productType === 'PAPER' || i.productType === 'COMBO')
  const hasDigital = inputs.some((i) => i.productType === 'DIGITAL' || i.productType === 'COMBO')
  const orderType: StorefrontOrder['orderType'] = hasPaper && hasDigital ? 'COMBO' : hasPaper ? 'PAPER' : 'DIGITAL'

  let totalAmount = 0n
  let discountAmount = 0n
  let totalQuantity = 0
  const items: StorefrontOrderItem[] = []

  for (const input of inputs) {
    if (input.productType === 'COMBO') {
      const paperCat = CATALOG_BY_SLUG.get(input.slug) ?? CATALOG_BY_SLUG.get(input.slug.replace(/^combo-/, ''))
      const paperUnit = paperCat?.type === 'PAPER' ? paperCat.unitAmountVnd : parseVnd(input.unitAmountVnd)
      const stylePrefix = input.slug.replace(/^combo-/, '').split('-')[0] ?? ''
      const digCat = (input.linkedDigitalSlug ? CATALOG_BY_SLUG.get(input.linkedDigitalSlug) : undefined)
        ?? DIGITAL_BY_STYLE.get(stylePrefix)
      const digUnit = digCat?.type === 'DIGITAL' ? digCat.unitAmountVnd : parseVnd(input.linkedDigitalUnitVnd)
      const digDiscount = digUnit / 2n
      const lineTotal = paperUnit * BigInt(input.quantity) + (digUnit - digDiscount)

      totalAmount += lineTotal
      discountAmount += digDiscount
      totalQuantity += input.quantity + 1
      const linkedDigitalSlug = input.linkedDigitalSlug ?? digCat?.slug
      items.push({
        slug: input.slug,
        name: input.name,
        productType: 'COMBO',
        ...(input.shape ? { shape: input.shape } : {}),
        quantity: input.quantity,
        unitAmountVnd: paperUnit.toString(),
        ...(linkedDigitalSlug ? { linkedDigitalSlug } : {}),
        linkedDigitalName: input.linkedDigitalName ?? digCat?.name ?? 'Thiệp Online MORI',
        linkedDigitalUnitVnd: digUnit.toString(),
        discountAmountVnd: digDiscount.toString(),
        lineTotalVnd: lineTotal.toString(),
      })
      continue
    }

    const cat = CATALOG_BY_SLUG.get(input.slug)
    const unitVnd = cat && cat.type === input.productType ? cat.unitAmountVnd : parseVnd(input.unitAmountVnd)
    const rawTotal = unitVnd * BigInt(input.quantity)
    const itemDiscount = input.productType === 'DIGITAL' && hasPaper ? rawTotal / 2n : 0n
    const lineTotal = rawTotal - itemDiscount

    totalAmount += lineTotal
    discountAmount += itemDiscount
    totalQuantity += input.quantity
    items.push({
      slug: input.slug,
      name: input.name,
      productType: input.productType,
      ...(input.shape ? { shape: input.shape } : {}),
      quantity: input.quantity,
      unitAmountVnd: unitVnd.toString(),
      discountAmountVnd: itemDiscount.toString(),
      lineTotalVnd: lineTotal.toString(),
    })
  }

  const summary = items
    .map((it) => (it.productType === 'COMBO' ? `Combo ${it.name} (${it.quantity} bộ) + ${it.linkedDigitalName ?? 'Thiệp Online'} (-50%)` : `${it.name} (${it.quantity})`))
    .join(' + ')

  return { orderType, items, totalAmount, discountAmount, totalQuantity, summary }
}

export function readJsonFile<T>(filePath: string): T[] | null {
  try {
    if (!existsSync(filePath)) return null
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as T[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // Ignore write failure in read-only environments
  }
}
