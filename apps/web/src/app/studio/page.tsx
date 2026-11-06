import { cookies } from 'next/headers'
import { HomeNav } from '../home-nav'
import './studio.css'
import '../workspace/workspace.css'

export const dynamic = 'force-dynamic'

interface StudioQueueItem {
  requestId: string
  kind: string
  status: string
  internalTitle: string
}

const kindLabel: Record<string, string> = {
  PAPER: 'Thiệp giấy mỹ thuật',
  DIGITAL: 'Thiệp cưới số',
  BUNDLE: 'Gói trọn bộ',
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Chờ tiếp nhận',
  CONFIRMED: 'Đã nhận việc',
  IN_FULFILLMENT: 'Đang thiết kế/chế tác',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function StudioPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/requests`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể kết nối đến máy chủ.</div>
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
            <p>Vui lòng đăng nhập bằng tài khoản nghệ nhân của xưởng.</p>
            <a href="/login" className="workspace-btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Đăng nhập tài khoản xưởng
            </a>
          </div>
        </main>
      </>
    )
  }

  if (response.status === 404 || response.status === 403) {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Tài khoản hiện tại không có quyền truy cập xưởng chế tác.</p>
            <a href="/workspace" className="workspace-btn-secondary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Về việc của tôi
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
          <div className="studio-empty">Không thể tải danh sách hàng đợi của xưởng.</div>
        </main>
      </>
    )
  }

  const items = (await response.json()) as StudioQueueItem[]

  return (
    <>
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <h1>Hàng đợi chế tác &amp; Thiết kế</h1>
            <p>Quản lý các yêu cầu thiết kế riêng và bản in ấn thiệp cưới đang xử lý.</p>
          </div>
          <div className="studio-actions">
            <a href="/admin/ai" className="workspace-btn-secondary" style={{ marginRight: '8px' }}>
              ✦ Cấu hình AI
            </a>
            <a href="/studio/orders" className="workspace-btn-primary">
              Danh sách đơn in ấn →
            </a>
          </div>
        </header>

        <section className="studio-card">
          <div className="workspace-section-head">
            <h2>Yêu cầu thiết kế cần xử lý ({items.length})</h2>
          </div>
          {items.length === 0 ? (
            <div className="studio-empty">Hiện tại không có yêu cầu nào trong hàng đợi.</div>
          ) : (
            <div className="studio-grid">
              {items.map((item) => (
                <div key={item.requestId} className="studio-item">
                  <div className="studio-item-info">
                    <span className="studio-item-title">{item.internalTitle || 'Yêu cầu không tên'}</span>
                    <span className="studio-item-meta">
                      {kindLabel[item.kind] ?? item.kind} · Mã: #{item.requestId.slice(0, 8)}
                    </span>
                  </div>
                  <div className="workspace-item-actions">
                    <span className={`badge-tag ${item.status}`}>{statusLabel[item.status] ?? item.status}</span>
                    <a href={`/studio/requests/${item.requestId}`} className="workspace-action-link">
                      Xử lý yêu cầu →
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
