'use client'

import { AssistantChatBubble } from './assistant-chat-bubble'
import { useAssistantChat } from './use-assistant-chat'

export function AssistantForm() {
  const {
    messages,
    input,
    setInput,
    loading,
    quickOptions,
    scrollAnchorRef,
    sendMessage,
    handleReset,
  } = useAssistantChat()

  return (
    <div className="assistant-container">
      <div className="chat-window-pane">
        <div className="chat-pane-header">
          <div className="chat-header-identity">
            <div className="atelier-avatar-small" aria-hidden="true">
              <span>M</span>
            </div>
            <div className="chat-header-text">
              <span className="chat-header-title">MORI · Trợ lý gợi ý</span>
              <span className="chat-header-status">
                <span className="status-indicator-dot" /> Hỗ trợ chọn mẫu và hoàn thiện nội dung
              </span>
            </div>
          </div>

          <button
            type="button"
            className="chat-header-reset-btn"
            title="Làm mới cuộc trò chuyện"
            onClick={handleReset}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Làm mới
          </button>
        </div>

        <div className="chat-messages-flow" role="log" aria-live="polite" aria-relevant="additions text" aria-busy={loading}>
          {messages.map((m) => (
            <AssistantChatBubble key={m.id} message={m} />
          ))}
          {loading && (
            <div className="chat-row assistant-row">
              <div className="atelier-avatar" aria-hidden="true">
                <span>M</span>
              </div>
              <div className="assistant-bubble-container">
                <div className="typing-indicator-bar">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-label">MORI đang chuẩn bị câu trả lời...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        <div className="chat-input-dock">
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
            <label className="assistant-sr-only" htmlFor="assistant-message">Tin nhắn của bạn</label>
            <input
              id="assistant-message"
              type="text"
              className="chat-input-field"
              placeholder="Bạn muốn hỏi MORI điều gì?"
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
