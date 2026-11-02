import { cookies } from 'next/headers'
import '../../login/login.css'

export const dynamic = 'force-dynamic'

interface StudioOrderItem {
  orderId: string
  status: string
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Đã xác nhận',
  IN_FULFILLMENT: 'Đang thực hiện',
  COMPLETED: 'Đã xong',
  CANCELLED: 'Đã hủy',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function StudioOrdersPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/orders`, {
      headers: { cookie },
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Đơn xưởng</h1>
        <p>Không mở được danh sách đơn.</p>
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
        <p>Trang này dành cho tài khoản xưởng.</p>
      </main>
    )
  }
  const orders = (await response.json()) as StudioOrderItem[]
  return (
    <main className="login">
      <h1>Đơn xưởng</h1>
      <p>
        <a href="/studio">Hàng đợi</a>
      </p>
      {orders.length === 0 ? <p>Chưa có đơn được giao.</p> : null}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId}>
            <a href={`/studio/orders/${order.orderId}`}>
              {statusLabel[order.status] ?? order.status}
              {order.isFixture ? ' · Mẫu thử' : ''}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
