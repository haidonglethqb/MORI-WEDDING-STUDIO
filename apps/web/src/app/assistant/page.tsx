import { cookies } from 'next/headers'
import Link from 'next/link'
import { CartDrawerFallback } from '../../features/cart/cart-drawer-fallback'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { AdminAiLogs } from '../admin/ai/admin-ai-logs'
import { AssistantForm } from './assistant-form'
import '../../features/cart/storefront-footer.css'
import '../../features/digital-templates/digital-templates.css'
import '../../features/digital-templates/digital-templates-themes.css'
import '../../features/digital-templates/template-custom-ai.css'
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

  if (isStaff) {
    return (
      <div className="admin-ai-shell">
        <HomeNav />
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
                Xem chi tiết các tool Agent đã gọi, Input/Output JSON và trả lời trực tiếp các phiên cần hỗ trợ.
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
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="assistant-shell is-fullpage">
      <HomeNav />
      <main className="assistant-page is-fullpage">
        <AssistantForm isLoggedIn={Boolean(role)} />
      </main>
      <CartDrawerFallback />
    </div>
  )
}
