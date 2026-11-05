import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
import '../studio.css'
import '../../workspace/workspace.css'

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
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể kết nối đến máy chủ quản lý đơn hàng.</div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Vui lòng đăng nhập bằng tài khoản nghệ nhân/xưởng studio.</p>
            <a href="/login" className="workspace-btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Đăng nhập tài khoản xưởng
            </a>
          </div>
        </main>
      </>
    )
  }

  if (!response.ok) {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Trang này dành riêng cho tài khoản xưởng chế tác.</p>
            <a href="/workspace" className="workspace-btn-outline" style={{ display: 'inline-block', marginTop: '12px' }}>
              Về trang khách hàng
            </a>
          </div>
        </main>
      </>
    )
  }

  const orders = (await response.json()) as StudioOrderItem[]

  return (
    <>
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <h1>Đơn in ấn xưởng chế tác</h1>
            <p>Theo dõi và cập nhật công đoạn in thiệp giấy mỹ thuật và bàn giao thiệp số.</p>
          </div>
          <div className="studio-actions">
            <a href="/studio" className="workspace-btn-outline">
              ← Hàng đợi yêu cầu
            </a>
          </div>
        </header>

        <section className="studio-card">
          <div className="workspace-section-head">
            <h2>Danh sách đơn cần thực hiện ({orders.length})</h2>
          </div>

          {orders.length === 0 ? (
            <div className="studio-empty">Hiện tại chưa có đơn in ấn nào được giao.</div>
          ) : (
            <div className="studio-grid">
              {orders.map((order) => (
                <div key={order.orderId} className="studio-item">
                  <div className="studio-item-info">
                    <span className="studio-item-title">
                      Đơn hàng #{order.orderId.slice(0, 8)}
                      {order.isFixture ? ' (Mẫu thử nghiệm)' : ''}
                    </span>
                    <span className="studio-item-meta">
                      Giấy: {order.physicalStage ?? 'Không có'} · Thiệp số: {order.digitalStage ?? 'Không có'}
                    </span>
                  </div>
                  <div className="workspace-item-actions">
                    <span className={`badge-tag ${order.status}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <a href={`/studio/orders/${order.orderId}`} className="workspace-action-link">
                      Xử lý công đoạn →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
