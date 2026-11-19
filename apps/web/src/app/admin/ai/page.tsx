import { cookies } from 'next/headers'
import Link from 'next/link'
import { HomeFooter } from '../../home-footer'
import { HomeNav } from '../../home-nav'
import { AdminAiManager, type AdminAiTabKey } from './admin-ai-manager'
import type { InitialConfigPayload } from './admin-ai-types'
import '../../../features/digital-templates/digital-templates.css'
import '../../../features/digital-templates/digital-templates-themes.css'
import '../../../features/digital-templates/template-custom-ai.css'
import './admin-ai.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

const FALLBACK_CONFIG: InitialConfigPayload = {
  config: {
    provider: 'CODEX',
    codexApiKeyMasked: '',
    hasCodexApiKey: false,
    codexBaseUrl: 'https://api.modelapi.vn/v1',
    codexPrimaryModel: 'gpt-6.1-sol',
    codexFallbackModel: 'gpt-6.1-terra',
    groqApiKeyMasked: '',
    hasGroqApiKey: false,
    groqPrimaryModel: 'openai/gpt-oss-120b',
  },
  availableCodexModels: ['gpt-6.1-sol', 'gpt-6.1-terra', 'gpt-6-sol', 'gpt-6-luna'],
  availableGroqModels: ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'],
}

export default async function AdminAiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: AdminAiTabKey =
    tab === 'storefront' ? 'storefront' : tab === 'config' ? 'config' : 'logs'

  const cookie = (await cookies()).toString()
  let role: string | null = null
  let payload: InitialConfigPayload = FALLBACK_CONFIG

  try {
    const meRes = await fetch(`${apiOrigin()}/api/v1/me`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    if (meRes.ok) {
      const me = (await meRes.json()) as { user?: { role?: string } | null; role?: string }
      role = me.user?.role ?? me.role ?? null
    }
  } catch {
    role = null
  }

  const isAuthorized = role === 'ADMIN' || role === 'STUDIO'

  if (isAuthorized) {
    try {
      const res = await fetch(`${apiOrigin()}/api/v1/admin/ai-config`, {
        headers: cookie ? { cookie } : {},
        cache: 'no-store',
      })
      if (res.ok) payload = (await res.json()) as InitialConfigPayload
    } catch {
      // Fallback config
    }
  }

  return (
    <div className="admin-ai-shell">
      <HomeNav />
      <main className="admin-ai-page">
        <div className="admin-ai-container">
          <div className="admin-ai-header">
            <div className="admin-breadcrumbs">
              <Link href="/studio">Xưởng chế tác</Link>
              <span>/</span>
              <span>Quản trị Hội thoại &amp; Đơn hàng MORI</span>
            </div>
            <h1 className="admin-page-title">Quản Trị Hội Thoại Khách Hàng &amp; AI Studio</h1>
            <p className="admin-page-desc">
              Theo dõi toàn bộ cuộc trò chuyện của khách hàng với chatbot, trả lời trực tiếp các
              phiên cần nhân viên hỗ trợ và cập nhật tiến độ đơn hàng trên website.
            </p>
          </div>

          {isAuthorized ? (
            <AdminAiManager initial={payload} initialTab={initialTab} />
          ) : (
            <div className="admin-ai-card admin-auth-guard">
              <h2>Cần quyền Quản trị viên hoặc Xưởng MORI</h2>
              <p>
                Vui lòng đăng nhập bằng tài khoản ADMIN / STUDIO để xem hội thoại khách hàng và
                quản lý đơn đặt thiệp.
              </p>
              <Link href="/login" className="btn-primary">
                Đăng nhập tài khoản quản trị
              </Link>
            </div>
          )}
        </div>
      </main>
      <HomeFooter />
    </div>
  )
}
