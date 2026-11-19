'use client'

import { useState } from 'react'
import type { BespokeDesignBlueprint } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'

interface Props {
  model: DigitalInvitationModel
  design: BespokeDesignBlueprint
  onChange: (next: DigitalInvitationModel) => void
}

const COLOR_FIELDS: { key: 'bg' | 'surface' | 'text' | 'accent'; label: string }[] = [
  { key: 'bg', label: 'Màu nền' },
  { key: 'surface', label: 'Màu khung' },
  { key: 'text', label: 'Màu chữ' },
  { key: 'accent', label: 'Màu nhấn' },
]

export function CustomizerAiControls({ model, design, onChange }: Props) {
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')

  function patchThemeColor(key: 'bg' | 'surface' | 'text' | 'accent', hex: string) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
    onChange({
      ...model,
      customDesign: {
        ...design,
        theme: { ...design.theme, [key]: hex.toUpperCase() },
      },
    })
  }

  async function askAiEdit() {
    const text = prompt.trim()
    if (!text || busy) return
    setBusy(true)
    setFeedback('AI đang chỉnh sửa trực tiếp bản thiết kế của bạn...')
    try {
      const res = await fetch('/assistant/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: `Chỉnh sửa mẫu thiệp online đang mở theo yêu cầu sau (giữ nguyên các biến {{GROOM_NAME}}, {{BRIDE_NAME}}, {{HERO_PHOTO}} nếu có): ${text}`,
          history: [],
          liveContext: {
            currentPath: '/invitations/editor',
            activeBespokeDesign: {
              conceptName: design.conceptName,
              ...(design.customHtml ? { customHtml: design.customHtml } : {}),
              ...(design.customCss ? { customCss: design.customCss } : {}),
              theme: { ...design.theme },
              displayNames: model.displayNames,
              hasUserPhoto: Boolean(model.photos.heroUrl),
            },
          },
        }),
      })
      if (!res.ok) {
        setFeedback('Chưa thể kết nối AI lúc này. Bạn thử lại sau vài giây nhé.')
        return
      }
      const data = (await res.json()) as {
        proposedActions?: Array<{ type: string; customDesign?: BespokeDesignBlueprint }>
      }
      const bespoke = data.proposedActions?.find((a) => a.type === 'BESPOKE_DESIGN_PREVIEW' && a.customDesign)
      if (!bespoke?.customDesign) {
        setFeedback('AI chưa trả về bản sửa mới — hãy mô tả rõ chi tiết cần đổi (màu, hiệu ứng, bố cục).')
        return
      }
      onChange({ ...model, templateId: 'custom-ai', customDesign: bespoke.customDesign })
      setPrompt('')
      setFeedback('Đã cập nhật bản thiết kế mới! Nhớ bấm “Lưu bản nháp” để lưu lại.')
    } catch {
      setFeedback('Lỗi kết nối tới trợ lý AI.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cfg-ai-box">
      <div className="cfg-ai-head">
        <strong>✦ Thiết kế riêng: {design.conceptName}</strong>
        <small>Chỉnh màu nhanh bên dưới hoặc nhắn AI sửa trực tiếp hiệu ứng, bố cục &amp; họa tiết.</small>
      </div>

      <div className="cfg-ai-colors">
        {COLOR_FIELDS.map((item) => (
          <label key={item.key} className="cfg-color-chip">
            <input
              type="color"
              value={design.theme[item.key]}
              onChange={(e) => patchThemeColor(item.key, e.target.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="cfg-ai-prompt-row">
        <input
          type="text"
          className="cfg-input"
          placeholder="Nhắn AI chỉnh mẫu này (VD: đổi nền xanh ngọc, thêm hiệu ứng hoa rơi)..."
          value={prompt}
          disabled={busy}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void askAiEdit()
            }
          }}
        />
        <button type="button" className="cfg-upload-btn" disabled={busy || !prompt.trim()} onClick={() => void askAiEdit()}>
          {busy ? 'Đang sửa...' : 'AI chỉnh ngay ✦'}
        </button>
      </div>

      {feedback ? <small className="cfg-ai-feedback">{feedback}</small> : null}
    </div>
  )
}
