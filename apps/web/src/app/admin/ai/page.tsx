import { cookies } from 'next/headers'
import Link from 'next/link'
import { HomeNav } from '../../home-nav'
import { AdminAiManager } from './admin-ai-manager'
import type { InitialConfigPayload } from './admin-ai-types'
import './admin-ai.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function AdminAiPage() {
  const cookieStore = await cookies()
  const cookie = cookieStore.toString()

  let payload: InitialConfigPayload = {
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
    availableCodexModels: [
      'gpt-6.1-sol',
      'gpt-6.1-terra',
      'gpt-6-sol',
      'gpt-6-luna',
      'gpt-6-astra',
      'gpt-5.6-sol',
    ],
    availableGroqModels: [
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
    ],
  }

  try {
    const res = await fetch(`${apiOrigin()}/api/v1/admin/ai-config`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    if (res.ok) {
      payload = (await res.json()) as InitialConfigPayload
    }
  } catch {
    // Use fallback payload
  }

  return (
    <>
      <HomeNav />
      <main className="admin-ai-page">
        <div className="admin-ai-container">
          <div className="admin-ai-header">
            <div className="admin-breadcrumbs">
              <Link href="/studio">Xưởng chế tác</Link>
              <span>/</span>
              <span>Quản trị AI Studio</span>
            </div>
            <h1 className="admin-page-title">Cấu Hình Trợ Lý Nghệ Nhân MORI</h1>
            <p className="admin-page-desc">
              Chủ động điều phối mô hình trí tuệ nhân tạo, chuyển đổi linh hoạt giữa Codex (OpenAI Sol), Groq Cloud hoặc Fallback nội bộ xưởng.
            </p>
          </div>

          <AdminAiManager initial={payload} />
        </div>
      </main>
    </>
  )
}
