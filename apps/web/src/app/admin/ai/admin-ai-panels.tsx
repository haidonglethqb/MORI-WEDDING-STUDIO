'use client'

import type { InitialConfigPayload } from './admin-ai-types'

interface CodexPanelProps {
  initial: InitialConfigPayload
  codexBaseUrl: string
  setCodexBaseUrl: (val: string) => void
  codexApiKey: string
  setCodexApiKey: (val: string) => void
  codexPrimaryModel: string
  setCodexPrimaryModel: (val: string) => void
  codexFallbackModel: string
  setCodexFallbackModel: (val: string) => void
}

export function CodexConfigPanel({
  initial,
  codexBaseUrl,
  setCodexBaseUrl,
  codexApiKey,
  setCodexApiKey,
  codexPrimaryModel,
  setCodexPrimaryModel,
  codexFallbackModel,
  setCodexFallbackModel,
}: CodexPanelProps) {
  return (
    <div className="admin-ai-subpanel">
      <div className="field-group">
        <label className="field-label">Codex Base URL</label>
        <input
          type="text"
          className="text-input"
          value={codexBaseUrl}
          onChange={(e) => setCodexBaseUrl(e.target.value)}
          placeholder="https://api.modelapi.vn/v1"
        />
      </div>

      <div className="field-group">
        <label className="field-label">
          Codex API Key {initial.config.hasCodexApiKey && <span className="key-hint">(Đã lưu: {initial.config.codexApiKeyMasked})</span>}
        </label>
        <input
          type="password"
          className="text-input"
          value={codexApiKey}
          onChange={(e) => setCodexApiKey(e.target.value)}
          placeholder={initial.config.hasCodexApiKey ? 'Nhập key mới nếu muốn đổi...' : 'sk-...'}
        />
      </div>

      <div className="field-row">
        <div className="field-group flex-1">
          <label className="field-label">Model Chính (Tier 1)</label>
          <select
            className="select-input"
            value={codexPrimaryModel}
            onChange={(e) => setCodexPrimaryModel(e.target.value)}
          >
            {initial.availableCodexModels.map((m) => (
              <option key={m} value={m}>{m} {m === 'gpt-6.1-sol' ? '★ (Khuyên dùng)' : ''}</option>
            ))}
          </select>
        </div>
        <div className="field-group flex-1">
          <label className="field-label">Model Dự Phòng (Tier 2)</label>
          <select
            className="select-input"
            value={codexFallbackModel}
            onChange={(e) => setCodexFallbackModel(e.target.value)}
          >
            {initial.availableCodexModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

interface GroqPanelProps {
  initial: InitialConfigPayload
  groqApiKey: string
  setGroqApiKey: (val: string) => void
  groqPrimaryModel: string
  setGroqPrimaryModel: (val: string) => void
}

export function GroqConfigPanel({
  initial,
  groqApiKey,
  setGroqApiKey,
  groqPrimaryModel,
  setGroqPrimaryModel,
}: GroqPanelProps) {
  return (
    <div className="admin-ai-subpanel">
      <div className="field-group">
        <label className="field-label">
          Groq API Key {initial.config.hasGroqApiKey && <span className="key-hint">(Đã lưu: {initial.config.groqApiKeyMasked})</span>}
        </label>
        <input
          type="password"
          className="text-input"
          value={groqApiKey}
          onChange={(e) => setGroqApiKey(e.target.value)}
          placeholder="gsk_..."
        />
      </div>
      <div className="field-group">
        <label className="field-label">Groq Model</label>
        <select
          className="select-input"
          value={groqPrimaryModel}
          onChange={(e) => setGroqPrimaryModel(e.target.value)}
        >
          {initial.availableGroqModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
