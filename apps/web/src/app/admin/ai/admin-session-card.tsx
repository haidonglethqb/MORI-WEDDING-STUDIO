'use client'

import type { AiConversationSession } from './admin-ai-types'

interface SessionCardProps {
  session: AiConversationSession
  isSelected: boolean
  isEscalated: boolean
  onSelect: (sessionId: string) => void
}

export function AdminSessionCard({
  session,
  isSelected,
  isEscalated,
  onSelect,
}: SessionCardProps) {
  const lastTurn = session.turns[session.turns.length - 1]
  const previewText =
    lastTurn?.userMessage ||
    session.escalationReason ||
    session.escalationNote ||
    'Chưa có tin nhắn'
  const contact = session.customerContact || session.contactInfo
  const totalTools = session.turns.reduce((sum, t) => sum + (t.toolTraces?.length ?? 0), 0)

  return (
    <div
      className={`session-summary-card ${isSelected ? 'is-active' : ''} ${
        isEscalated ? 'is-escalated' : ''
      }`}
      onClick={() => onSelect(session.sessionId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(session.sessionId)
      }}
    >
      <div className="summary-card-top">
        <span className="summary-session-id">{session.sessionId}</span>
        <span className="summary-turn-count">
          {session.turnsCount} lượt{totalTools > 0 ? ` · ⚙ ${totalTools} tool` : ''}
        </span>
      </div>

      {isEscalated && (
        <div className="summary-escalation-row">
          <span className="needs-support-pill">CẦN NHÂN VIÊN HỖ TRỢ</span>
        </div>
      )}

      {(session.brief.coupleNames || contact) && (
        <div className="summary-couple-tag">
          {session.brief.coupleNames ? `Cặp đôi: ${session.brief.coupleNames}` : ''}
          {session.brief.coupleNames && contact ? ' · ' : ''}
          {contact ? `LH: ${contact}` : ''}
        </div>
      )}

      <div className="summary-preview-message">“{previewText}”</div>

      <div className="summary-card-bottom">
        <span className="summary-model-pill">
          {(session.adminReplies?.length ?? 0) > 0
            ? `${session.adminReplies?.length} phản hồi NV`
            : session.lastModelUsed}
        </span>
        <span className="summary-time">
          {new Date(session.updatedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
