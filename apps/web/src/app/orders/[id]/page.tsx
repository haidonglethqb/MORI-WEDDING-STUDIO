import { cookies } from 'next/headers'
import '../../login/login.css'
import { CancelOrder } from './cancel-order'

export const dynamic = 'force-dynamic'

interface OrderDetail {
  orderId: string
  status: string
  currency: 'VND'
  totalAmountVnd: string
  shippingAmountVnd: string | null
  taxAmountVnd: string | null
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
  physicalOnHold: boolean
  holdReason: string | null
  shipRecipientName: string | null
  shipLocality: string | null
  shipProvince: string | null
  shipmentExceptions: { reason: string; createdAt: string }[]
  cancellations: { state: string; reason: string }[]
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Đã xác nhận',
  IN_FULFILLMENT: 'Đang thực hiện',
  COMPLETED: 'Đã xong',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xử lý',
  IN_PRODUCTION: 'Đang làm',
  QUALITY_CHECK: 'Đang kiểm tra',
  READY_TO_SHIP: 'Sẵn sàng giao',
  SHIPPED: 'Đã chuyển đi',
  DELIVERED: 'Đã tới nơi',
  IN_PROGRESS: 'Đang chuẩn bị bản số',
  READY_FOR_HANDOVER: 'Sẵn sàng bàn giao',
  HANDED_OVER: 'Đã bàn giao',
  REQUESTED: 'Đang chờ xưởng xem',
  APPROVED: 'Đã chấp nhận',
  DENIED: 'Xưởng giữ đơn',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

function label(value: string | null): string {
  if (!value) return 'Không có'
  return statusLabel[value] ?? value
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/orders/${id}`, {
      headers: { cookie },
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Đơn hàng</h1>
        <p>Đơn này không xem được.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Đơn hàng</h1>
        <p>
          <a href="/login">Đăng nhập để xem đơn của bạn.</a>
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Đơn hàng</h1>
        <p>Đơn này không xem được.</p>
      </main>
    )
  }
  const order = (await response.json()) as OrderDetail
  return (
    <main className="login">
      <h1>Đơn hàng</h1>
      <p>
        {label(order.status)} · {order.totalAmountVnd} {order.currency}
        {order.isFixture ? ' · Mẫu thử' : ''}
      </p>
      <p>Phí giao: {order.shippingAmountVnd ?? 'Chưa chốt'} VND</p>
      <p>Thuế: {order.taxAmountVnd ?? 'Chưa chốt'} VND</p>
      <h2>Thiệp giấy</h2>
      <p>{label(order.physicalStage)}</p>
      {order.physicalOnHold ? <p>Đơn đang tạm dừng. {order.holdReason}</p> : null}
      {order.shipRecipientName ? (
        <p>
          Giao tới {order.shipRecipientName}, {order.shipLocality}, {order.shipProvince}
        </p>
      ) : null}
      <h2>Thiệp số</h2>
      <p>{label(order.digitalStage)}</p>
      <h2>Giao hàng</h2>
      {order.shipmentExceptions.length === 0 ? <p>Chưa có sự cố giao hàng.</p> : null}
      <ul>
        {order.shipmentExceptions.map((event) => (
          <li key={event.createdAt}>{event.reason}</li>
        ))}
      </ul>
      <h2>Hủy đơn</h2>
      {order.cancellations.length === 0 ? <p>Chưa có yêu cầu hủy.</p> : null}
      <ul>
        {order.cancellations.map((row) => (
          <li key={row.reason}>
            {label(row.state)} · {row.reason}
          </li>
        ))}
      </ul>
      {order.status === 'CANCELLED' || order.cancellations.some((row) => row.state === 'REQUESTED') ? null : (
        <CancelOrder orderId={order.orderId} />
      )}
    </main>
  )
}
