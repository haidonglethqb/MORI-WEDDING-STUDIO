'use client'

import { useState } from 'react'
import type { AiConversationSession } from './admin-ai-types'
import { AdminSessionBrief } from './admin-session-brief'
import { AdminTurnToolInspector } from './admin-turn-tool-inspector'

interface SessionViewProps {
  session: AiConversationSession
  onDeleteSession: (sessionId: string) => Promise<void>
  onSessionUpdated: () => Promise<void>
}

export function AdminAiSessionView({
  session,
  onDeleteSession,
  onSessionUpdated,
}: SessionViewProps) {
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null)

  const staffReplies = session.adminReplies ?? []
  const totalToolCalls = session.turns.reduce((sum, t) => sum + (t.toolTraces?.length ?? 0), 0)
  const contactText = session.customerContact || session.contactInfo
  const escalationDetail = session.escalationReason || session.escalationNote
  const isEscalated = Boolean(
    session.needsHumanSupport || session.needsHuman || session.escalated || contactText,
  )

  async function handleSendReply(event: React.FormEvent) {
    event.preventDefault()
    const clean = replyText.trim()
    if (!clean || sending) return
    setSending(true)
    setReplyFeedback(null)
    try {
      const res = await fetch(`/admin/ai/logs/${encodeURIComponent(session.sessionId)}/reply`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: clean, adminName: 'Nhân viên tư vấn MORI' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReplyText('')
      setReplyFeedback('✓ Đã gửi phản hồi trực tiếp tới khung chat của khách hàng.')
      await onSessionUpdated()
    } catch {
      setReplyFeedback('✕ Chưa thể gửi phản hồi lúc này. Vui lòng kiểm tra kết nối API.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="session-detail-pane">
      <div className="session-detail-header">
        <div className="session-detail-title-group">
          <div className="session-id-row">
            <span className="session-id-badge">{session.sessionId}</span>
            {isEscalated && <span className="needs-support-pill">CẦN NHÂN VIÊN HỖ TRỢ</span>}
            <span className="session-meta-pill">{session.turnsCount} lượt hỏi đáp</span>
            {totalToolCalls > 0 ? (
              <span className="session-meta-pill">⚙ {totalToolCalls} tool calls</span>
            ) : null}
            <span className="session-meta-pill model-pill">{session.lastModelUsed}</span>
          </div>
          <span className="session-timestamp-text">
            Cập nhật lần cuối:{' '}
            {new Date(session.updatedAt).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
        <button
          type="button"
          className="btn-danger-sm"
          onClick={() => void onDeleteSession(session.sessionId)}
        >
          Xóa phiên này
        </button>
      </div>

      {isEscalated && (
        <div className="session-escalation-box" role="status">
          <strong>Khách hàng đã yêu cầu gặp nhân viên tư vấn MORI</strong>
          <div className="escalation-meta-lines">
            <span>Thông tin liên hệ: {contactText || 'Chưa để lại SĐT/Email'}</span>
            {escalationDetail && <span>Ghi chú của khách: “{escalationDetail}”</span>}
          </div>
        </div>
      )}

      <AdminSessionBrief brief={session.brief} />

      <div className="session-turns-timeline">
        <div className="turns-timeline-title">
          Lịch sử trò chuyện ({session.turns.length} lượt AI · {staffReplies.length} phản hồi NV)
        </div>
        {session.turns.map((turn) => (
          <div key={turn.id} className="timeline-turn-card">
            <div className="turn-user-box">
              <div className="turn-box-header">
                <span className="turn-badge user-turn-badge">
                  [Lượt {turn.turnIndex}] Khách hàng nhắn
                </span>
                <span className="turn-timestamp">
                  {new Date(turn.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="turn-user-content">“{turn.userMessage}”</div>
            </div>

            <div className="turn-assistant-box">
              <div className="turn-box-header">
                <span className="turn-badge assistant-turn-badge">MORI Agent trả lời</span>
                <span className="log-model-badge">
                  {turn.modelUsed} · {turn.latencyMs}ms
                </span>
              </div>
              <AdminTurnToolInspector
                toolTraces={turn.toolTraces}
                proposedActions={turn.proposedActions}
              />
              <div className="turn-reply-content">{turn.assistantReply}</div>
            </div>
          </div>
        ))}

        {staffReplies.map((reply) => {
          const senderName = reply.sender || reply.adminName || 'Nhân viên tư vấn MORI'
          const replyBody = reply.message || reply.content || ''
          const replyTime = reply.timestamp || reply.createdAt || session.updatedAt
          return (
            <div key={reply.id} className="timeline-staff-card">
              <div className="turn-box-header">
                <span className="turn-badge staff-turn-badge">
                  ✓ {senderName} đã trả lời trực tiếp
                </span>
                <span className="turn-timestamp">
                  {new Date(replyTime).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
              <div className="turn-reply-content">{replyBody}</div>
            </div>
          )
        })}
      </div>

      <form className="admin-reply-composer" onSubmit={(e) => void handleSendReply(e)}>
        <label htmlFor={`reply-${session.sessionId}`}>
          Phản hồi trực tiếp tới khách hàng trong phiên chat này
        </label>
        <textarea
          id={`reply-${session.sessionId}`}
          rows={3}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Nhập nội dung tư vấn, báo giá hoặc hướng dẫn tiếp theo gửi cho khách hàng..."
          disabled={sending}
        />
        {replyFeedback && <div className="admin-reply-feedback">{replyFeedback}</div>}
        <div className="admin-reply-actions">
          <button type="submit" className="btn-primary" disabled={sending || !replyText.trim()}>
            {sending ? 'Đang gửi phản hồi...' : 'Gửi phản hồi tới khách hàng'}
          </button>
        </div>
      </form>
    </div>
  )
}
