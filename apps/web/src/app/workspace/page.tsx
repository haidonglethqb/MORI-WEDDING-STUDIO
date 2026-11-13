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

async function readList<T>(response: Response | null): Promise<T[]> {
  if (!response?.ok) return []
  try {
    return (await response.json()) as T[]
  } catch {
    return []
  }
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
            <a href="/login" className="workspace-btn-primary">
              Đăng nhập ngay
            </a>
          </div>
        </main>
      </>
    )
  }

  const [ordersResult, requestsResult, noticesResult] = await Promise.allSettled([
    fetch(`${apiOrigin()}/api/v1/orders/mine`, { headers: { cookie }, cache: 'no-store' }),
    fetch(`${apiOrigin()}/api/v1/requests/mine`, { headers: { cookie }, cache: 'no-store' }),
    fetch(`${apiOrigin()}/api/v1/me/notifications`, { headers: { cookie }, cache: 'no-store' }),
  ])
  const ordersRes = ordersResult.status === 'fulfilled' ? ordersResult.value : null
  const requestsRes = requestsResult.status === 'fulfilled' ? requestsResult.value : null
  const noticesRes = noticesResult.status === 'fulfilled' ? noticesResult.value : null
  const [items, orders, requests, notices] = await Promise.all([
    readList<InvitationListItem>(response),
    readList<OrderListItem>(ordersRes),
    readList<CustomerRequestItem>(requestsRes),
    readList<{ notificationId: string; plainText: string; readAt: string | null }>(noticesRes),
  ])

  return (
    <>
      <HomeNav />
      <main className="workspace-page">
        <header className="workspace-header">
          <div>
            <span className="atelier-eyebrow">MORI Atelier · Việc của tôi</span>
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
                <h2>Thiệp cưới trực tuyến ({response.ok ? items.length : '—'})</h2>
              </div>
              {response.ok ? <InvitationList items={items} /> : <WorkspaceLoadError label="thiệp trực tuyến" />}
            </section>

            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Yêu cầu thiết kế riêng ({requestsRes?.ok ? requests.length : '—'})</h2>
              </div>
              <div className="workspace-request-starter">
                <CreateDesignRequest />
              </div>
              {requestsRes?.ok ? <RequestList requests={requests} /> : <WorkspaceLoadError label="yêu cầu thiết kế" />}
            </section>
          </div>

          <div>
            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Đơn in ấn ({ordersRes?.ok ? orders.length : '—'})</h2>
              </div>
              {ordersRes?.ok ? <OrderList orders={orders} /> : <WorkspaceLoadError label="đơn hàng" />}
            </section>

            <section className="workspace-section">
              <div className="workspace-section-head">
                <h2>Thông báo từ xưởng</h2>
              </div>
              {!noticesRes?.ok ? <WorkspaceLoadError label="thông báo" /> : notices.length === 0 ? (
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

function WorkspaceLoadError({ label }: { label: string }) {
  return (
    <div className="workspace-load-error" role="status">
      <span>Chưa tải được {label}; dữ liệu của bạn vẫn được giữ nguyên.</span>
      <a href="/workspace">Thử tải lại</a>
    </div>
  )
}
