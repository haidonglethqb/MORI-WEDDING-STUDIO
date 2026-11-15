import type { CustomRequestRecord, StorefrontOrderRecord } from './admin-ai-types'

function asRecord(val: unknown): Record<string, unknown> | null {
  return typeof val === 'object' && val !== null ? (val as Record<string, unknown>) : null
}

function readStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number' || typeof v === 'bigint') return String(v)
  }
  return ''
}

function readStepNum(val: unknown): number | null {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0 ? val : null
}

export function extractArrayPayload(payload: unknown, ...keys: string[]): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload.map(asRecord).filter((x): x is Record<string, unknown> => x !== null)
  }
  const obj = asRecord(payload)
  if (!obj) return []
  for (const key of [...keys, 'items', 'data', 'records']) {
    const candidate = obj[key]
    if (Array.isArray(candidate)) {
      return candidate.map(asRecord).filter((x): x is Record<string, unknown> => x !== null)
    }
  }
  return []
}

export function normalizeOrderRow(raw: Record<string, unknown>): StorefrontOrderRecord {
  const typeRaw = readStr(raw, 'orderType', 'kind', 'type').toUpperCase()
  const orderType: 'PAPER' | 'DIGITAL' | 'COMBO' =
    typeRaw === 'COMBO' || typeRaw === 'BUNDLE'
      ? 'COMBO'
      : typeRaw === 'ONLINE' || typeRaw === 'DIGITAL'
        ? 'DIGITAL'
        : 'PAPER'

  const items = Array.isArray(raw['items']) ? (raw['items'] as Array<Record<string, unknown>>) : []
  const itemsLabel = items
    .map((it) => `${readStr(it, 'productTitle', 'productName', 'name')} × ${Number(it['quantity'] ?? 1)}`)
    .filter((s) => !s.startsWith(' ×'))
    .join(', ')

  const street = readStr(raw, 'shippingAddress', 'deliveryAddress', 'address')
  const city = readStr(raw, 'city')
  const shippingAddress = street && city ? `${street}, ${city}` : street || city || '—'
  const phone = readStr(raw, 'customerPhone', 'phone', 'contact')
  const email = readStr(raw, 'customerEmail', 'email')

  return {
    orderCode: readStr(raw, 'code', 'orderCode') || 'MORI',
    customerName: readStr(raw, 'customerName', 'fullName', 'name') || 'Khách hàng MORI',
    contact: [phone, email].filter(Boolean).join(' · ') || '—',
    productSummary:
      readStr(raw, 'summary', 'productSummary', 'productName') ||
      itemsLabel ||
      'Bộ thiệp cưới MORI',
    orderType,
    quantity: Number(raw['totalQuantity'] ?? raw['quantity'] ?? 1) || 1,
    totalAmountVnd: readStr(raw, 'totalAmountVnd', 'totalVnd') || '0',
    paidAmountVnd: readStr(raw, 'paidAmountVnd', 'paidVnd') || '0',
    paymentStatus: readStr(raw, 'paymentStatus') || 'Chờ xác nhận',
    shippingAddress,
    paperStepIndex:
      orderType === 'PAPER' || orderType === 'COMBO' ? (readStepNum(raw['paperStepIndex']) ?? 0) : null,
    onlineStepIndex:
      orderType === 'DIGITAL' || orderType === 'COMBO'
        ? (readStepNum(raw['onlineStepIndex']) ?? 0)
        : null,
    createdAt: readStr(raw, 'createdAt', 'orderedAt'),
  }
}

export function normalizeRequestRow(raw: Record<string, unknown>): CustomRequestRecord {
  const statusRaw = readStr(raw, 'status').toUpperCase()
  const status =
    statusRaw === 'CONTACTED' || statusRaw === 'DONE' || statusRaw === 'NEW' ? statusRaw : 'NEW'

  return {
    id: readStr(raw, 'id', 'requestId') || 'unknown',
    customerName: readStr(raw, 'customerName', 'fullName', 'name') || 'Khách hàng MORI',
    contact: readStr(raw, 'customerPhone', 'phone', 'contact', 'customerContact') || '—',
    email: readStr(raw, 'customerEmail', 'email'),
    coupleNames: readStr(raw, 'coupleNames'),
    weddingDate: readStr(raw, 'weddingDate'),
    style: readStr(raw, 'style'),
    fontCode: readStr(raw, 'fontCode', 'selectedFont', 'preferredFont'),
    styleNote:
      readStr(raw, 'notes', 'description', 'idea', 'styleNote', 'message') ||
      'Yêu cầu thiết kế riêng từ khách hàng',
    quantity: readStr(raw, 'quantity', 'estimatedSuites') || 'Chưa rõ',
    status,
    adminNote: readStr(raw, 'adminNote', 'staffNote'),
    createdAt: readStr(raw, 'createdAt'),
  }
}
