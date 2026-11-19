import { cookies } from 'next/headers'
import Link from 'next/link'
import { CartDrawerFallback } from '../../features/cart/cart-drawer-fallback'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { AdminAiLogs } from '../admin/ai/admin-ai-logs'
import { AssistantForm } from './assistant-form'
import '../../features/cart/storefront-footer.css'
import '../admin/ai/admin-ai.css'
import './assistant.css'
import './radiant-prompt.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

interface MePayload {
  user?: { role?: string; displayName?: string } | null
  role?: string
}

async function fetchViewerRole(): Promise<string | null> {
  const cookie = (await cookies()).toString()
  if (!cookie) return null
  try {
    const res = await fetch(`${apiOrigin()}/api/v1/me`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as MePayload
    return data.user?.role ?? data.role ?? null
  } catch {
    return null
  }
}

export default async function AssistantPage() {
  const role = await fetchViewerRole()
  const isStaff = role === 'ADMIN' || role === 'STUDIO'

  return (
    <div className={isStaff ? 'admin-ai-shell' : 'assistant-shell'}>
      <HomeNav />
      {isStaff ? (
        <main className="admin-ai-page">
          <div className="admin-ai-container">
            <div className="admin-ai-header">
              <div className="admin-breadcrumbs">
                <Link href="/studio">Xưởng chế tác</Link>
                <span>/</span>
                <span>Hội thoại khách hàng</span>
              </div>
              <h1 className="admin-page-title">Theo Dõi &amp; Trả Lời Hội Thoại Khách Hàng</h1>
              <p className="admin-page-desc">
                Tài khoản Admin / Xưởng sẽ xem toàn bộ cuộc trò chuyện của khách với chatbot và
                trả lời trực tiếp các phiên cần nhân viên hỗ trợ.
              </p>
              <div className="assistant-staff-banner-actions">
                <Link href="/admin/ai" className="assistant-staff-primary-link">
                  Mở trang Quản trị AI &amp; Đơn hàng đầy đủ
                </Link>
                <Link href="/studio" className="assistant-staff-secondary-link">
                  Về Xưởng chế tác
                </Link>
              </div>
            </div>

            <div className="admin-ai-card">
              <AdminAiLogs />
            </div>
          </div>
        </main>
      ) : (
        <main className="assistant-page">
          <header className="assistant-header">
            <span className="assistant-badge">MORI WEDDING STUDIO · AI AGENT</span>
            <h1>MORI Atelier AI Agent</h1>
            <p>
              Tư vấn mẫu thiệp theo không gian tiệc &amp; moodboard, tính combo giảm 50%, tra cứu
              đơn hàng và khởi tạo bản nháp Thiệp Online chỉ với một chạm.
            </p>
          </header>

          <AssistantForm />
        </main>
      )}
      <CartDrawerFallback />
      <HomeFooter />
    </div>
  )
}
