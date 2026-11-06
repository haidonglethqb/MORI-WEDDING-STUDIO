'use client'

import { useState } from 'react'
import type { InitialConfigPayload, TestResultData } from './admin-ai-types'
import { CodexConfigPanel, GroqConfigPanel } from './admin-ai-panels'

export function AdminAiManager({ initial }: { initial: InitialConfigPayload }) {
  const [provider, setProvider] = useState<'CODEX' | 'GROQ' | 'LOCAL_ONLY'>(initial.config.provider)
  const [codexApiKey, setCodexApiKey] = useState('')
  const [codexBaseUrl, setCodexBaseUrl] = useState(initial.config.codexBaseUrl)
  const [codexPrimaryModel, setCodexPrimaryModel] = useState(initial.config.codexPrimaryModel)
  const [codexFallbackModel, setCodexFallbackModel] = useState(initial.config.codexFallbackModel)
  const [groqApiKey, setGroqApiKey] = useState('')
  const [groqPrimaryModel, setGroqPrimaryModel] = useState(initial.config.groqPrimaryModel)

  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<TestResultData | null>(null)

  async function handleSave() {
    setSaving(true)
    setStatusMessage(null)
    try {
      const res = await fetch('/admin/ai/config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider,
          codexApiKey: codexApiKey || undefined,
          codexBaseUrl,
          codexPrimaryModel,
          codexFallbackModel,
          groqApiKey: groqApiKey || undefined,
          groqPrimaryModel,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatusMessage('✓ Đã cập nhật cấu hình AI thành công và áp dụng cho toàn hệ thống!')
    } catch {
      setStatusMessage('✕ Lỗi khi lưu cấu hình. Vui lòng kiểm tra quyền quản trị.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/admin/ai/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: provider === 'CODEX' ? codexApiKey || undefined : groqApiKey || undefined,
          baseUrl: provider === 'CODEX' ? codexBaseUrl : undefined,
          model: provider === 'CODEX' ? codexPrimaryModel : groqPrimaryModel,
        }),
      })
      const data = (await res.json()) as { ok: boolean; latencyMs?: number; model?: string; sampleReply?: string; error?: string }
      if (data.ok) {
        setTestResult({
          ok: true,
          message: `Thành công! Độ trễ: ${data.latencyMs}ms | Model: ${data.model} | Phản hồi: "${data.sampleReply?.slice(0, 60)}..."`,
        })
      } else {
        setTestResult({ ok: false, message: `Thất bại: ${data.error || 'Lỗi kết nối'}` })
      }
    } catch (err) {
      setTestResult({ ok: false, message: `Lỗi: ${err instanceof Error ? err.message : String(err)}` })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="admin-ai-card">
      <div className="admin-ai-section">
        <label className="section-title">Chế độ AI Chính Cho Toàn Hệ Thống</label>
        <div className="provider-tabs">
          <button
            type="button"
            className={`provider-tab ${provider === 'CODEX' ? 'active' : ''}`}
            onClick={() => setProvider('CODEX')}
          >
            ✦ Codex (ModelAPI / OpenAI)
            <span className="tab-sub">gpt-6.1-sol • Cao cấp nhất</span>
          </button>
          <button
            type="button"
            className={`provider-tab ${provider === 'GROQ' ? 'active' : ''}`}
            onClick={() => setProvider('GROQ')}
          >
            Groq Cloud
            <span className="tab-sub">Tốc độ cao • Failover</span>
          </button>
          <button
            type="button"
            className={`provider-tab ${provider === 'LOCAL_ONLY' ? 'active' : ''}`}
            onClick={() => setProvider('LOCAL_ONLY')}
          >
            Local Fallback
            <span className="tab-sub">Nội bộ xưởng</span>
          </button>
        </div>
      </div>

      {provider === 'CODEX' && (
        <CodexConfigPanel
          initial={initial}
          codexBaseUrl={codexBaseUrl}
          setCodexBaseUrl={setCodexBaseUrl}
          codexApiKey={codexApiKey}
          setCodexApiKey={setCodexApiKey}
          codexPrimaryModel={codexPrimaryModel}
          setCodexPrimaryModel={setCodexPrimaryModel}
          codexFallbackModel={codexFallbackModel}
          setCodexFallbackModel={setCodexFallbackModel}
        />
      )}

      {provider === 'GROQ' && (
        <GroqConfigPanel
          initial={initial}
          groqApiKey={groqApiKey}
          setGroqApiKey={setGroqApiKey}
          groqPrimaryModel={groqPrimaryModel}
          setGroqPrimaryModel={setGroqPrimaryModel}
        />
      )}

      {testResult && (
        <div className={`test-feedback-box ${testResult.ok ? 'success' : 'error'}`}>
          {testResult.message}
        </div>
      )}

      {statusMessage && <div className="save-status-box">{statusMessage}</div>}

      <div className="admin-actions-bar">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleTest}
          disabled={testing || saving}
        >
          {testing ? 'Đang kiểm tra kết nối...' : '✦ Kiểm tra kết nối (Live Test)'}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu cấu hình...' : 'Lưu cấu hình hệ thống'}
        </button>
      </div>
    </div>
  )
}
