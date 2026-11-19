'use client'

import { useState, type DragEvent } from 'react'
import { AssistantChatBubble } from './assistant-chat-bubble'
import { AssistantComposer } from './assistant-composer'
import { AssistantContextBar } from './assistant-context-bar'
import { AssistantToolTrace } from './assistant-tool-trace'
import { useAssistantChat } from './use-assistant-chat'

export function AssistantForm({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [showEscalate, setShowEscalate] = useState(false)
  const [draggingPhoto, setDraggingPhoto] = useState(false)
  const {
    messages, brief, input, setInput, loading, activeStatus, activeTraces,
    streamingText, attachment, setAttachment, attachMoodboardImage, latestUserPhoto, quotaExceeded,
    escalated, escalating, escalateError, quickOptions, scrollAnchorRef,
    sendMessage, escalateToHuman, handleReset,
  } = useAssistantChat(isLoggedIn)

  const guestUsed = messages.filter((m) => m.role === 'user').length
  const guestRemaining = Math.max(0, 5 - guestUsed)
  const inputLocked = loading || quotaExceeded

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDraggingPhoto(false)
    if (inputLocked) return
    const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith('image/'))
    if (file) void attachMoodboardImage(file, `${file.name} · Sẽ tự ghép vào thiệp`)
  }

  return (
    <div
      className={`assistant-container${draggingPhoto ? ' is-photo-drag' : ''}`}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
          e.preventDefault()
          setDraggingPhoto(true)
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDraggingPhoto(false)
      }}
      onDrop={handleDrop}
    >
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
                    : 'Thiết kế thiệp online · Dán ảnh Ctrl+V · Báo giá combo -50% · Tra đơn'}
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

        <div className="chat-messages-flow" role="log" aria-live="polite" aria-relevant="additions text" aria-busy={loading}>
          <div className="chat-messages-inner">
            {messages.map((m) => (
              <AssistantChatBubble key={m.id} message={m} sessionPhotoUrl={latestUserPhoto} />
            ))}

            {loading ? (
              <div className="chat-row assistant-row">
                <div className="atelier-avatar is-working" aria-hidden="true"><span>M</span></div>
                <div className="assistant-bubble-container">
                  <div className="assistant-bubble-header">
                    <span className="atelier-name">MORI Atelier Agent</span>
                    <span className="atelier-role">Đang thiết kế</span>
                  </div>
                  <AssistantToolTrace traces={activeTraces} live statusText={activeStatus} />
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

        <AssistantComposer
          isLoggedIn={isLoggedIn}
          quotaExceeded={quotaExceeded}
          guestRemaining={guestRemaining}
          inputLocked={inputLocked}
          loading={loading}
          input={input}
          setInput={setInput}
          attachment={attachment}
          setAttachment={setAttachment}
          attachMoodboardImage={attachMoodboardImage}
          quickOptions={quickOptions}
          sendMessage={sendMessage}
          showEscalate={showEscalate}
          setShowEscalate={setShowEscalate}
          escalated={escalated}
          escalating={escalating}
          escalateError={escalateError}
          escalateToHuman={escalateToHuman}
        />
      </div>
    </div>
  )
}
