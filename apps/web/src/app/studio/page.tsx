import { cookies } from 'next/headers'
import Link from 'next/link'
import { HomeFooter } from '../home-footer'
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
  PAPER: 'Thiệp giấy bã mía',
  DIGITAL: 'Thiệp cưới online',
  BUNDLE: 'Combo thiệp giấy & online',
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Chờ tiếp nhận',
  CONFIRMED: 'Đã nhận việc',
  IN_FULFILLMENT: 'Đang thiết kế / chế tác',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  APPROVED: 'Đang trao đổi',
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
      <div className="studio-shell">
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể kết nối đến máy chủ.</div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (response.status === 401) {
    return (
      <div className="studio-shell">
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Vui lòng đăng nhập bằng tài khoản nghệ nhân hoặc quản trị viên MORI.</p>
            <Link href="/login" className="workspace-btn-primary">
              Đăng nhập tài khoản xưởng
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (response.status === 404 || response.status === 403) {
    return (
      <div className="studio-shell">
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Tài khoản hiện tại không có quyền truy cập khu vực quản lý.</p>
            <Link href="/collections" className="workspace-btn-secondary">
              Về bộ sưu tập
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (!response.ok) {
    return (
      <div className="studio-shell">
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể tải danh sách hàng đợi của xưởng.</div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  const items = (await response.json()) as StudioQueueItem[]

  return (
    <div className="studio-shell">
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <span className="atelier-eyebrow">Xưởng MORI · {items.length} yêu cầu đang mở</span>
            <h1>Hàng đợi chế tác &amp; Hỗ trợ khách hàng</h1>
            <p>
              Theo dõi các yêu cầu thiết kế riêng, đơn hàng thiệp cưới và phản hồi hội thoại
              chatbot từ khách hàng.
            </p>
          </div>
          <div className="studio-actions">
            <Link href="/admin/ai" className="workspace-btn-secondary">
              Nhật ký Chatbot &amp; Hỗ trợ
            </Link>
            <Link href="/admin/ai?tab=storefront" className="workspace-btn-secondary">
              Đơn hàng &amp; Thiết kế riêng
            </Link>
            <Link href="/studio/orders" className="workspace-btn-primary">
              Danh sách đơn in ấn
            </Link>
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
                    <span className="studio-item-title">
                      {item.internalTitle || 'Yêu cầu không tên'}
                    </span>
                    <span className="studio-item-meta">
                      {kindLabel[item.kind] ?? item.kind} · Mã: #{item.requestId.slice(0, 8)}
                    </span>
                  </div>
                  <div className="workspace-item-actions">
                    <span className={`badge-tag ${item.status}`}>
                      {statusLabel[item.status] ?? item.status}
                    </span>
                    <Link href={`/studio/requests/${item.requestId}`} className="workspace-action-link">
                      Xử lý yêu cầu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}
