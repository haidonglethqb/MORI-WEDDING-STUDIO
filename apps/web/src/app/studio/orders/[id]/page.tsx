import { cookies } from 'next/headers'
import '../../../login/login.css'
import { AdvanceOrder } from './advance-order'
import { DecideCancellation } from './decide-cancellation'
import { OrderException } from './order-exception'

export const dynamic = 'force-dynamic'

interface StudioOrderItem {
  orderId: string
  status: string
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
  cancellations: { cancellationId: string; state: string; reason: string }[]
}

const stageLabel: Record<string, string> = {
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
  return stageLabel[value] ?? value
}

export default async function StudioOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/orders/${id}`, {
      headers: { cookie },
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Đơn xưởng</h1>
        <p>Không mở được đơn.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Đơn xưởng</h1>
        <p>
          <a href="/login">Đăng nhập</a> bằng tài khoản xưởng.
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Đơn xưởng</h1>
        <p>Đơn này không nằm trong việc của bạn.</p>
      </main>
    )
  }
  const order = (await response.json()) as StudioOrderItem
  return (
    <main className="login">
      <h1>Đơn xưởng</h1>
      <p>
        {label(order.status)}
        {order.isFixture ? ' · Mẫu thử' : ''}
      </p>
      <h2>Yêu cầu hủy</h2>
      {order.cancellations.length === 0 ? <p>Chưa có yêu cầu hủy.</p> : null}
      <ul>
        {order.cancellations.map((row) => (
          <li key={row.cancellationId}>
            {label(row.state)} · {row.reason}
            {row.state === 'REQUESTED' ? (
              <DecideCancellation orderId={order.orderId} cancellationId={row.cancellationId} />
            ) : null}
          </li>
        ))}
      </ul>
      <OrderException orderId={order.orderId} />
      <h2>Thiệp giấy</h2>
      <p>{label(order.physicalStage)}</p>
      {order.physicalStage && order.physicalStage !== 'DELIVERED' ? (
        <AdvanceOrder orderId={order.orderId} track="physical" label="Sang bước giấy tiếp theo" />
      ) : null}
      <h2>Thiệp số</h2>
      <p>{label(order.digitalStage)}</p>
      {order.digitalStage && order.digitalStage !== 'HANDED_OVER' ? (
        <AdvanceOrder orderId={order.orderId} track="digital" label="Sang bước số tiếp theo" />
      ) : null}
    </main>
  )
}
