'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AssistantChatBubble } from './assistant-chat-bubble'
import { AssistantContextBar } from './assistant-context-bar'
import { AssistantEscalatePanel } from './assistant-escalate-panel'
import { AssistantToolTrace } from './assistant-tool-trace'
import { useAssistantChat } from './use-assistant-chat'

export function AssistantForm({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [showEscalate, setShowEscalate] = useState(false)
  const {
    messages, brief, input, setInput, loading, activeStatus, activeTraces,
    streamingText, attachment, setAttachment, attachMoodboardImage, quotaExceeded,
    escalated, escalating, escalateError, quickOptions, scrollAnchorRef,
    sendMessage, escalateToHuman, handleReset,
  } = useAssistantChat()

  const guestUsed = messages.filter((m) => m.role === 'user').length
  const guestRemaining = Math.max(0, 5 - guestUsed)
  const inputLocked = loading || (!isLoggedIn && quotaExceeded)

  return (
    <div className="assistant-container">
      <div className="chat-window-pane">
        <div className="chat-pane-header">
          <div className="chat-pane-header-inner">
            <div className="chat-header-identity">
              <div className="atelier-avatar-small" aria-hidden="true"><span>M</span></div>
              <div className="chat-header-text">
                <span className="chat-header-title">
                  MORI Atelier
                  <span className="chat-agent-chip">AI Agent</span>
                </span>
                <span className="chat-header-status">
                  <span className="status-indicator-dot" />
                  {escalated
                    ? 'Đã kết nối Nhân viên tư vấn MORI (phản hồi tự cập nhật)'
                    : 'Tư vấn mẫu · Tính combo -50% · Tra đơn · Tạo thiệp online'}
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className={`chat-escalate-btn ${escalated ? 'is-active' : ''}`}
                onClick={() => setShowEscalate((prev) => !prev)}
              >
                {escalated ? '✓ Đang kết nối NV' : 'Gặp nhân viên tư vấn'}
              </button>
              <button type="button" className="chat-header-reset-btn" onClick={handleReset}>
                Phiên mới
              </button>
            </div>
          </div>
        </div>

        <AssistantContextBar brief={brief} />

        <div
          className="chat-messages-flow"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-busy={loading}
        >
          <div className="chat-messages-inner">
            {messages.map((m) => (
              <AssistantChatBubble key={m.id} message={m} />
            ))}

            {loading ? (
              <div className="chat-row assistant-row">
                <div className="atelier-avatar is-working" aria-hidden="true"><span>M</span></div>
                <div className="assistant-bubble-container">
                  <div className="assistant-bubble-header">
                    <span className="atelier-name">MORI Atelier Agent</span>
                    <span className="atelier-role">Đang làm việc</span>
                  </div>

                  <AssistantToolTrace
                    traces={activeTraces}
                    live
                    statusText={activeStatus}
                  />

                  {streamingText ? (
                    <div className="assistant-bubble-content">
                      <div className="bubble-text-flow">
                        {streamingText}
                        <span className="agent-streaming-cursor" aria-hidden="true" />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div ref={scrollAnchorRef} />
          </div>
        </div>

        <div className="chat-input-dock">
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
                <span>{attachment.label || 'Ảnh moodboard'}</span>
                <button type="button" onClick={() => setAttachment(null)} aria-label="Bỏ ảnh">✕</button>
              </div>
            ) : null}

            {!isLoggedIn && quotaExceeded ? (
              <div className="guest-quota-banner" role="alert">
                <span>Bạn đã dùng hết 5/5 câu hỏi miễn phí hôm nay. Đăng nhập để tiếp tục nhắn tin với MORI Agent!</span>
                <Link href="/login" className="guest-quota-login-btn">Đăng nhập ngay →</Link>
              </div>
            ) : !isLoggedIn ? (
              <div className="guest-quota-strip">
                <span>Chế độ khách chưa đăng nhập · Còn <strong>{guestRemaining}/5</strong> câu hỏi miễn phí hôm nay</span>
                <Link href="/login">Đăng nhập để mở 30 lượt/ngày →</Link>
              </div>
            ) : null}

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

            <form
              className="chat-input-form radiant-prompt"
              onSubmit={(e) => {
                e.preventDefault()
                if (!inputLocked) void sendMessage(input)
              }}
            >
              <label className="agent-attach-btn" title="Gửi ảnh moodboard hoặc mẫu thiệp tham khảo">
                + Ảnh
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={inputLocked}
                  onChange={(e) => {
                    void attachMoodboardImage(e.target.files?.[0])
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
                    ? 'Bạn đã hết 5 câu hỏi miễn phí — vui lòng đăng nhập để tiếp tục...'
                    : 'Chia sẻ phong cách, số khách, mã đơn MORI-1001, hoặc nhờ Agent tạo thiệp online...'
                }
                value={input}
                disabled={inputLocked}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={inputLocked || !input.trim()}
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
      </div>
    </div>
  )
}
