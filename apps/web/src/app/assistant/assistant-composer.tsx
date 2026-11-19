'use client'

import Link from 'next/link'
import type { ClipboardEvent } from 'react'
import { AssistantEscalatePanel } from './assistant-escalate-panel'
import type { AgentAttachment } from './assistant-types'

interface Props {
  isLoggedIn: boolean
  quotaExceeded: boolean
  guestRemaining: number
  inputLocked: boolean
  loading: boolean
  input: string
  setInput: (val: string) => void
  attachment: AgentAttachment | null
  setAttachment: (val: AgentAttachment | null) => void
  attachMoodboardImage: (file: File | undefined, label?: string) => Promise<void>
  quickOptions: string[]
  sendMessage: (text: string) => Promise<void>
  showEscalate: boolean
  setShowEscalate: (val: boolean) => void
  escalated: boolean
  escalating: boolean
  escalateError: string | null
  escalateToHuman: (contact: string, note: string) => Promise<boolean>
}

export function AssistantComposer({
  isLoggedIn, quotaExceeded, guestRemaining, inputLocked, loading,
  input, setInput, attachment, setAttachment, attachMoodboardImage,
  quickOptions, sendMessage, showEscalate, setShowEscalate,
  escalated, escalating, escalateError, escalateToHuman,
}: Props) {
  function handlePaste(e: ClipboardEvent<HTMLElement>) {
    if (inputLocked) return
    const imgItem = Array.from(e.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'))
    const file = imgItem?.getAsFile()
    if (!file) return
    e.preventDefault()
    void attachMoodboardImage(file, 'Ảnh vừa dán (Ctrl+V) · Sẽ tự ghép vào thiệp')
  }

  return (
    <div className="chat-input-dock" onPaste={handlePaste}>
      <div className="chat-input-dock-inner">
        {showEscalate ? (
          <AssistantEscalatePanel
            escalated={escalated}
            submitting={escalating}
            errorMessage={escalateError}
            onSubmit={escalateToHuman}
            onClose={() => setShowEscalate(false)}
          />
        ) : null}

        {attachment ? (
          <div className="agent-attach-preview">
            <img src={attachment.dataUrl} alt="Ảnh đính kèm" />
            <span>{attachment.label || 'Ảnh đính kèm · AI sẽ ghép vào thiệp'}</span>
            <button type="button" onClick={() => setAttachment(null)} aria-label="Bỏ ảnh">✕</button>
          </div>
        ) : null}

        {!isLoggedIn && quotaExceeded ? (
          <div className="guest-quota-banner" role="alert">
            <span>Bạn đã dùng hết 5/5 câu hỏi miễn phí hôm nay. Đăng nhập để tiếp tục trò chuyện nhé!</span>
            <Link href="/login" className="guest-quota-login-btn">Đăng nhập ngay →</Link>
          </div>
        ) : isLoggedIn && quotaExceeded ? (
          <div className="guest-quota-banner" role="alert">
            <span>Bạn đã đạt hạn mức lượt AI hôm nay do quản trị viên đặt — bấm “Gặp nhân viên tư vấn” nếu cần hỗ trợ ngay nhé!</span>
          </div>
        ) : !isLoggedIn ? (
          <div className="guest-quota-strip">
            <span>Khách chưa đăng nhập · Còn <strong>{guestRemaining}/5</strong> câu miễn phí</span>
            <Link href="/login">Đăng nhập để nhắn không giới hạn →</Link>
          </div>
        ) : null}

        {!quotaExceeded && quickOptions.length > 0 ? (
          <div className="quick-chips-row">
            {quickOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className="quick-chip-button"
                disabled={inputLocked}
                onClick={() => void sendMessage(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="chat-input-form radiant-prompt"
          onSubmit={(e) => {
            e.preventDefault()
            if (!inputLocked) void sendMessage(input)
          }}
        >
          <label className="agent-attach-btn" title="Chọn ảnh hoặc nhấn Ctrl+V trong ô chat để dán ảnh ghép vào thiệp">
            + Ảnh
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={inputLocked}
              onChange={(e) => {
                const file = e.target.files?.[0]
                void attachMoodboardImage(file, file ? `${file.name} · Sẽ tự ghép vào thiệp` : undefined)
                e.currentTarget.value = ''
              }}
            />
          </label>
          <label className="assistant-sr-only" htmlFor="assistant-message">Tin nhắn của bạn</label>
          <input
            id="assistant-message"
            type="text"
            className="chat-input-field"
            placeholder={
              !isLoggedIn && quotaExceeded
                ? 'Bạn đã hết 5 câu miễn phí — đăng nhập để tiếp tục...'
                : 'Mô tả mẫu thiệp muốn tạo, hoặc nhấn Ctrl+V dán ảnh cưới để AI ghép vào thiệp...'
            }
            value={input}
            disabled={inputLocked}
            onPaste={handlePaste}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={inputLocked || (!input.trim() && !attachment)}
            aria-label="Gửi tin nhắn"
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
