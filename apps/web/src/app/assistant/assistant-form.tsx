'use client'

import { useState } from 'react'
import { AssistantChatBubble } from './assistant-chat-bubble'
import { AssistantContextBar } from './assistant-context-bar'
import { AssistantEscalatePanel } from './assistant-escalate-panel'
import { AssistantToolTrace } from './assistant-tool-trace'
import { useAssistantChat } from './use-assistant-chat'

export function AssistantForm() {
  const [showEscalate, setShowEscalate] = useState(false)
  const {
    messages,
    brief,
    input,
    setInput,
    loading,
    activeStatus,
    activeTraces,
    streamingText,
    attachment,
    setAttachment,
    attachMoodboardImage,
    escalated,
    escalating,
    escalateError,
    quickOptions,
    scrollAnchorRef,
    sendMessage,
    escalateToHuman,
    handleReset,
  } = useAssistantChat()

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

            <div className="quick-chips-row">
              {quickOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="quick-chip-button"
                  disabled={loading}
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
                void sendMessage(input)
              }}
            >
              <label className="agent-attach-btn" title="Gửi ảnh moodboard hoặc mẫu thiệp tham khảo">
                + Ảnh
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={loading}
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
                placeholder="Chia sẻ phong cách, số khách, mã đơn MORI-1001, hoặc nhờ Agent tạo thiệp online..."
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !input.trim()}
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
