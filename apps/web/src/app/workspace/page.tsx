import { cookies } from 'next/headers'
import { HomeNav } from '../home-nav'
import { CreateDesignRequest } from './create-request'
import { CreateInvitation } from './create-invitation'
import { InvitationList } from './invitation-list'
import { OrderList, RequestList, type OrderListItem, type CustomerRequestItem } from './order-list'
import './workspace.css'

export const dynamic = 'force-dynamic'

interface InvitationListItem {
  invitationId: string
  slug: string
  status: string
  eventTitle: string
  displayNames: [string, string]
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
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
      <>
        <HomeNav />
        <main className="workspace-page">
          <div className="workspace-empty">Không thể kết nối đến máy chủ.</div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="workspace-page">
          <div className="workspace-empty">
            <p>Vui lòng đăng nhập để xem không gian làm việc của bạn.</p>
            <a href="/login" className="workspace-btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Đăng nhập ngay
            </a>
          </div>
        </main>
      </>
    )
  }

  const items = response.ok ? ((await response.json()) as InvitationListItem[]) : []
  const ordersRes = await fetch(`${apiOrigin()}/api/v1/orders/mine`, { headers: { cookie }, cache: 'no-store' })
  const orders = ordersRes.ok ? ((await ordersRes.json()) as OrderListItem[]) : []
  const requestsRes = await fetch(`${apiOrigin()}/api/v1/requests/mine`, { headers: { cookie }, cache: 'no-store' })
  const requests = requestsRes.ok ? ((await requestsRes.json()) as CustomerRequestItem[]) : []
  const noticesRes = await fetch(`${apiOrigin()}/api/v1/me/notifications`, { headers: { cookie }, cache: 'no-store' })
  const notices = noticesRes.ok
    ? ((await noticesRes.json()) as { notificationId: string; plainText: string; readAt: string | null }[])
    : []

  return (
    <>
      <HomeNav />
      <main className="workspace-page">
        <header className="workspace-header">
          <div>
            <h1>Không gian làm việc</h1>
            <p>Theo dõi tiến độ thiết kế, thiệp cưới trực tuyến và đơn chế tác thủ công.</p>
          </div>
          <div className="workspace-actions">
            <a href="/addresses" className="workspace-btn-outline">
              Sổ địa chỉ
            </a>
            <CreateInvitation />
          </div>
        </header>

        <div className="workspace-grid">
          <div>
            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Thiệp cưới trực tuyến ({items.length})</h2>
              </div>
              <InvitationList items={items} />
            </section>

            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Yêu cầu thiết kế riêng ({requests.length})</h2>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <CreateDesignRequest />
              </div>
              <RequestList requests={requests} />
            </section>
          </div>

          <div>
            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Đơn in ấn ({orders.length})</h2>
              </div>
              <OrderList orders={orders} />
            </section>

            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Thông báo từ xưởng</h2>
              </div>
              {notices.length === 0 ? (
                <div className="workspace-empty">Chưa có thông báo nào.</div>
              ) : (
                <ul className="notice-list">
                  {notices.map((n) => (
                    <li key={n.notificationId} className="notice-item">
                      {n.plainText}
                      {!n.readAt ? <span className="notice-new">MỚI</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
