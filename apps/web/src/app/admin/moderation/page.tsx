import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
import { ModerateInvitation, type ModerationItemView } from './moderate-invitation'
import '../../studio/studio.css'
import '../../workspace/workspace.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function AdminModerationPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/admin/moderation`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể kết nối đến máy chủ kiểm duyệt.</div>
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
            <p>Vui lòng đăng nhập bằng tài khoản quản trị viên.</p>
            <a href="/login" className="workspace-btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Đăng nhập quản trị viên
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
            <p>Khu vực này chỉ dành riêng cho Quản trị viên hệ thống (vai trò ADMIN).</p>
            <a href="/" className="workspace-btn-outline" style={{ display: 'inline-block', marginTop: '12px' }}>
              Về trang chủ
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
          <div className="studio-empty">Không thể tải danh sách thiệp cần kiểm duyệt.</div>
        </main>
      </>
    )
  }

  const items = (await response.json()) as ModerationItemView[]

  return (
    <>
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7a8275', marginBottom: '8px' }}>
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</a>
              <span>/</span>
              <span>Quản trị kiểm duyệt</span>
            </div>
            <h1>Kiểm duyệt &amp; An toàn nội dung</h1>
            <p>Quản lý các báo cáo vi phạm nội dung thiệp cưới từ khách mời và cộng đồng.</p>
          </div>
        </header>

        <section className="studio-card">
          <div className="workspace-section-head">
            <h2>Danh sách thiệp có báo cáo ({items.length})</h2>
          </div>

          {items.length === 0 ? (
            <div className="studio-empty">Hiện tại không có báo cáo vi phạm nào cần kiểm duyệt.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {items.map((item) => (
                <ModerateInvitation key={item.invitationId} item={item} />
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
