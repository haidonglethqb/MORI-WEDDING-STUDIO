import type { CartItem } from '../../features/cart/cart-types'
import type { PaymentMethodCode } from './checkout-payment-methods'

export interface CheckoutOrderPayload {
  customerName: string
  customerPhone: string
  customerEmail: string
  paymentMethod: PaymentMethodCode
  address: string
  city: string
  coupleNames: string
  fontCode: string
  note: string
  items: CartItem[]
}

export interface CheckoutOrderResult {
  ok: boolean
  orderCode: string
  totalVnd?: number
  errorMessage?: string
}

export async function submitCheckoutOrder(
  payload: CheckoutOrderPayload,
): Promise<CheckoutOrderResult> {
  const response = await fetch('/api/storefront/orders', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      customerEmail: payload.customerEmail.trim(),
      paymentMethod: payload.paymentMethod,
      simulatePaid: payload.paymentMethod !== 'COD',
      address: payload.address.trim(),
      city: payload.city.trim(),
      ...(payload.coupleNames.trim() ? { coupleNames: payload.coupleNames.trim() } : {}),
      ...(payload.fontCode.trim() ? { fontCode: payload.fontCode.trim() } : {}),
      note: payload.note.trim(),
      items: payload.items.map((item) => ({
        slug: item.slug,
        name: item.name,
        productType: item.productType,
        ...(item.shape === 'FLAT' || item.shape === 'BIFOLD' ? { shape: item.shape } : {}),
        quantity: item.quantity,
        unitAmountVnd: item.unitAmountVnd,
        ...(item.linkedDigitalSlug ? { linkedDigitalSlug: item.linkedDigitalSlug } : {}),
        ...(item.linkedDigitalName ? { linkedDigitalName: item.linkedDigitalName } : {}),
        ...(item.linkedDigitalUnitVnd !== undefined
          ? { linkedDigitalUnitVnd: item.linkedDigitalUnitVnd }
          : {}),
      })),
    }),
  })

  const data = (await response.json().catch(() => ({}))) as {
    order?: { code?: string; totalAmountVnd?: string }
    orderCode?: string
    code?: string
    id?: string
    message?: string
  }

  if (!response.ok) {
    return {
      ok: false,
      orderCode: '',
      errorMessage:
        data.message ?? 'Không thể xác nhận đơn hàng lúc này. Vui lòng kiểm tra thông tin.',
    }
  }

  const resolvedCode = data.order?.code ?? data.orderCode ?? data.code ?? data.id ?? 'MORI-DEMO'
  const parsedTotal = data.order?.totalAmountVnd ? Number(data.order.totalAmountVnd) : undefined
  return {
    ok: true,
    orderCode: resolvedCode,
    ...(parsedTotal !== undefined && Number.isFinite(parsedTotal) ? { totalVnd: parsedTotal } : {}),
  }
}
