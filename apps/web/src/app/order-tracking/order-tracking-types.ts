import {
  ONLINE_TRACK_STEPS,
  PAPER_TRACK_STEPS,
  type TrackStepDef,
  type TrackingIconName,
} from './order-tracking-steps'

export { ONLINE_TRACK_STEPS, PAPER_TRACK_STEPS, type TrackStepDef, type TrackingIconName }

export interface TrackedOrder {
  orderCode: string
  createdAt: string
  productSummary: string
  cardTypeLabel: string
  quantity: number
  totalVnd: string
  paidVnd: string
  remainingVnd: string
  shippingAddress: string
  currentStatusLabel: string
  isCancelled: boolean
  hasPaper: boolean
  hasOnline: boolean
  paperStepIndex: number
  onlineStepIndex: number
  onlineLink: string | null
  paymentMethod: string | null
}

function toBigIntSafe(val: unknown): bigint {
  if (typeof val === 'bigint') return val
  if (typeof val === 'number' && Number.isFinite(val)) return BigInt(Math.trunc(val))
  if (typeof val === 'string') {
    const clean = val.replace(/[^\d-]/g, '')
    if (clean && /^-?\d+$/.test(clean)) return BigInt(clean)
  }
  return 0n
}

export function formatVndAmount(raw: string): string {
  return `${toBigIntSafe(raw).toLocaleString('vi-VN')} ₫`
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
    if (typeof val === 'number' || typeof val === 'bigint') return String(val)
  }
  return ''
}

function resolveStepIndex(steps: TrackStepDef[], statusVal: unknown, indexVal: unknown): number {
  if (typeof indexVal === 'number' && Number.isInteger(indexVal) && indexVal >= 0) {
    return Math.min(indexVal, steps.length - 1)
  }
  const text = typeof statusVal === 'string' ? statusVal.trim() : ''
  if (!text) return 0
  const upper = text.toUpperCase()
  const lower = text.toLowerCase()
  const matched = steps.findIndex(
    (s) => s.key === upper || s.aliases.includes(upper) || s.label.toLowerCase() === lower,
  )
  return matched >= 0 ? matched : 0
}

export function normalizeTrackedOrder(raw: Record<string, unknown>): TrackedOrder {
  const code = pickStr(raw, 'orderCode', 'code') || 'MORI'
  const createdAt = pickStr(raw, 'createdAt', 'orderedAt', 'orderDate')
  const rawType = pickStr(raw, 'orderType', 'kind', 'type').toUpperCase()

  const rawItems = Array.isArray(raw['items']) ? (raw['items'] as Array<Record<string, unknown>>) : []
  const itemNames = rawItems
    .map((it) => {
      const name = pickStr(it, 'productTitle', 'productName', 'name')
      const shape = pickStr(it, 'cardType', 'shapeLabel', 'shape')
      const qty = Number(it['quantity'] ?? 0)
      if (!name) return ''
      return `${name}${shape ? ` (${shape})` : ''}${qty > 0 ? ` × ${qty}` : ''}`
    })
    .filter(Boolean)

  const totalQty =
    Number(raw['quantity'] ?? raw['totalQuantity'] ?? 0) ||
    rawItems.reduce((acc, it) => acc + (Number(it['quantity'] ?? 0) || 0), 0) ||
    1

  const productSummary =
    pickStr(raw, 'summary', 'productName', 'productSummary') ||
    (itemNames.length > 0 ? itemNames.join(' · ') : 'Thiệp cưới MORI')

  const totalBig = toBigIntSafe(raw['totalAmountVnd'] ?? raw['totalVnd'] ?? raw['totalPriceVnd'])
  const paidBig = toBigIntSafe(raw['paidAmountVnd'] ?? raw['paidVnd'] ?? raw['depositPaidVnd'])
  const remSource = raw['remainingAmountVnd'] ?? raw['remainingVnd']
  const remBig = remSource !== undefined && remSource !== null ? toBigIntSafe(remSource) : totalBig - paidBig

  const hasCombo = rawType === 'COMBO' || rawType === 'BUNDLE'
  const hasPaper =
    hasCombo || rawType === 'PAPER' || Boolean(raw['paperStatus']) || (!rawType && !raw['onlineStatus'])
  const hasOnline =
    hasCombo ||
    rawType === 'ONLINE' ||
    rawType === 'DIGITAL' ||
    Boolean(raw['onlineStatus']) ||
    Boolean(raw['onlineLink'])

  const mainStatus = pickStr(raw, 'status', 'currentStatus')
  const paperStatus = pickStr(raw, 'paperStatus') || mainStatus
  const onlineStatus = pickStr(raw, 'onlineStatus') || mainStatus
  const paperIdx = resolveStepIndex(PAPER_TRACK_STEPS, paperStatus, raw['paperStepIndex'])
  const onlineIdx = resolveStepIndex(ONLINE_TRACK_STEPS, onlineStatus, raw['onlineStepIndex'])
  const isCancelled = mainStatus.toUpperCase() === 'CANCELLED'

  const cardTypeLabel =
    hasPaper && hasOnline
      ? 'Combo Thiệp giấy & Thiệp online'
      : hasOnline
        ? 'Thiệp cưới online'
        : pickStr(raw, 'cardTypeLabel', 'cardStyle') || 'Thiệp cưới giấy bã mía'

  const statusFallback = hasPaper
    ? PAPER_TRACK_STEPS[paperIdx]?.label ?? 'Đã tiếp nhận'
    : ONLINE_TRACK_STEPS[onlineIdx]?.label ?? 'Đã tiếp nhận'

  const street = pickStr(raw, 'shippingAddress', 'deliveryAddress', 'address')
  const city = pickStr(raw, 'city')
  const combinedAddress = street && city ? `${street}, ${city}` : street || city

  return {
    orderCode: code,
    createdAt,
    productSummary,
    cardTypeLabel,
    quantity: totalQty,
    totalVnd: totalBig.toString(),
    paidVnd: paidBig.toString(),
    remainingVnd: (remBig > 0n ? remBig : 0n).toString(),
    shippingAddress:
      combinedAddress ||
      (hasPaper ? 'Đang cập nhật địa chỉ' : 'Bàn giao qua đường link online'),
    currentStatusLabel: isCancelled
      ? 'Đã hủy'
      : pickStr(raw, 'currentStatusLabel', 'statusLabel') || statusFallback,
    isCancelled,
    hasPaper,
    hasOnline,
    paperStepIndex: paperIdx,
    onlineStepIndex: onlineIdx,
    onlineLink: typeof raw['onlineLink'] === 'string' && raw['onlineLink'] ? raw['onlineLink'] : null,
    paymentMethod: typeof raw['paymentMethod'] === 'string' ? raw['paymentMethod'] : null,
  }
}
