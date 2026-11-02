import { cookies } from 'next/headers'
import { CreateDesignRequest } from './create-request'
import { CreateInvitation } from './create-invitation'
import '../login/login.css'

export const dynamic = 'force-dynamic'

interface InvitationListItem {
  invitationId: string
  slug: string
  status: string
  eventTitle: string
  displayNames: [string, string]
}

interface OrderListItem {
  orderId: string
  status: string
  currency: 'VND'
  totalAmountVnd: string
  physicalStage: string | null
  digitalStage: string | null
}

interface CustomerRequestItem {
  requestId: string
  kind: string
  status: string
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đang phát hành',
  UNPUBLISHED: 'Đã gỡ',
  EXPIRED: 'Hết hạn',
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Xưởng đã nhận',
  IN_FULFILLMENT: 'Đang làm',
  COMPLETED: 'Đã xong',
  CANCELLED: 'Đã hủy',
}

export default async function WorkspacePage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/invitations/mine`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Việc của tôi</h1>
        <p>Không mở được danh sách thiệp.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Việc của tôi</h1>
        <p>
          <a href="/login">Đăng nhập</a> để xem thiệp của bạn.
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Việc của tôi</h1>
        <p>Không mở được danh sách thiệp.</p>
      </main>
    )
  }
  const items = (await response.json()) as InvitationListItem[]
  const ordersResponse = await fetch(`${apiOrigin()}/api/v1/orders/mine`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const orders = ordersResponse.ok ? ((await ordersResponse.json()) as OrderListItem[]) : []
  const requestsResponse = await fetch(`${apiOrigin()}/api/v1/requests/mine`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const requests = requestsResponse.ok ? ((await requestsResponse.json()) as CustomerRequestItem[]) : []
  const noticesResponse = await fetch(`${apiOrigin()}/api/v1/me/notifications`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const notices = noticesResponse.ok
    ? ((await noticesResponse.json()) as { notificationId: string; plainText: string; readAt: string | null }[])
    : []
  return (
    <main className="login">
      <h1>Việc của tôi</h1>
      <p>
        <a href="/addresses">Địa chỉ giao</a>
      </p>
      <CreateInvitation />
      <h2>Thông báo</h2>
      {notices.length === 0 ? <p>Chưa có thông báo.</p> : null}
      <ul>
        {notices.map((notice) => (
          <li key={notice.notificationId}>
            {notice.plainText}
            {notice.readAt ? '' : ' · Mới'}
          </li>
        ))}
      </ul>
      <h2>Đơn đã gửi</h2>
      {orders.length === 0 ? <p>Chưa có đơn nào.</p> : null}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId}>
            <a href={`/orders/${order.orderId}`}>
              {statusLabel[order.status] ?? order.status} · {order.totalAmountVnd} {order.currency}
            </a>
          </li>
        ))}
      </ul>
      <h2>Yêu cầu thiết kế</h2>
      <CreateDesignRequest />
      {requests.length === 0 ? <p>Chưa có yêu cầu nào.</p> : null}
      <ul>
        {requests.map((request) => (
          <li key={request.requestId}>
            <a href={`/requests/${request.requestId}`}>
              {request.kind} · {statusLabel[request.status] ?? request.status}
            </a>
          </li>
        ))}
      </ul>
      <h2>Thiệp</h2>
      {items.length === 0 ? <p>Chưa có thiệp nào.</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.invitationId}>
            <a href={`/invitations/${item.invitationId}`}>
              {item.displayNames[0]} &amp; {item.displayNames[1]}
            </a>
            <p>
              {item.eventTitle} · {statusLabel[item.status] ?? item.status}
            </p>
            {item.status === 'PUBLISHED' ? <a href={`/i/${item.slug}`}>Trang khách</a> : null}
          </li>
        ))}
      </ul>
    </main>
  )
}
