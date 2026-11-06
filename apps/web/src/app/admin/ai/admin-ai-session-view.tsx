'use client'

import type { AiConversationSession } from './admin-ai-types'

interface SessionViewProps {
  session: AiConversationSession
  onDeleteSession: (sessionId: string) => Promise<void>
}

export function AdminAiSessionView({ session, onDeleteSession }: SessionViewProps) {
  const { brief, turns } = session
  const hasBriefInfo =
    brief.coupleNames ||
    brief.weddingDate ||
    brief.location ||
    brief.guestCount ||
    brief.budget ||
    brief.aesthetic ||
    brief.targetShape

  return (
    <div className="session-detail-pane">
      <div className="session-detail-header">
        <div className="session-detail-title-group">
          <div className="session-id-row">
            <span className="session-id-badge">{session.sessionId}</span>
            <span className="session-meta-pill">{session.turnsCount} lượt hỏi đáp</span>
            <span className="session-meta-pill model-pill">{session.lastModelUsed}</span>
          </div>
          <span className="session-timestamp-text">
            Cập nhật lần cuối:{' '}
            {new Date(session.updatedAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}{' '}
            ngày {new Date(session.updatedAt).toLocaleDateString('vi-VN')}
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

      <div className="session-brief-card">
        <div className="brief-card-title">✦ Thông tin tiệc cưới riêng biệt của phiên này (Context)</div>
        {hasBriefInfo ? (
          <div className="brief-grid">
            {brief.coupleNames && (
              <div className="brief-item">
                <span className="brief-label">Cặp đôi:</span>
                <span className="brief-value">{brief.coupleNames}</span>
              </div>
            )}
            {brief.weddingDate && (
              <div className="brief-item">
                <span className="brief-label">Ngày cưới:</span>
                <span className="brief-value">{brief.weddingDate}</span>
              </div>
            )}
            {brief.location && (
              <div className="brief-item">
                <span className="brief-label">Địa điểm / Không gian:</span>
                <span className="brief-value">{brief.location}</span>
              </div>
            )}
            {brief.guestCount && (
              <div className="brief-item">
                <span className="brief-label">Quy mô tiệc:</span>
                <span className="brief-value">{brief.guestCount} khách</span>
              </div>
            )}
            {brief.aesthetic && (
              <div className="brief-item">
                <span className="brief-label">Gu thẩm mỹ:</span>
                <span className="brief-value">{brief.aesthetic}</span>
              </div>
            )}
            {brief.targetShape && (
              <div className="brief-item">
                <span className="brief-label">Dáng thiệp:</span>
                <span className="brief-value">
                  {brief.targetShape === 'BIFOLD' ? 'Gập đôi (Bi-fold)' : 'Khổ phẳng (Flat)'}
                </span>
              </div>
            )}
            {brief.budget && (
              <div className="brief-item">
                <span className="brief-label">Ngân sách tối đa:</span>
                <span className="brief-value">
                  {Number(brief.budget).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="brief-empty-note">
            Chưa có thông tin trích xuất cụ thể từ các lượt nhắn của khách.
          </div>
        )}
      </div>

      <div className="session-turns-timeline">
        <div className="turns-timeline-title">Lịch sử trò chuyện chi tiết ({turns.length} lượt)</div>
        {turns.map((turn) => {
          const isCodex = turn.modelUsed.includes('sol') || turn.modelUsed.includes('codex')
          const isGroq = turn.modelUsed.includes('groq') || turn.modelUsed.includes('oss')
          const modelClass = isCodex ? 'is-codex' : isGroq ? 'is-groq' : 'is-local'

          return (
            <div key={turn.id} className="timeline-turn-card">
              <div className="turn-user-box">
                <div className="turn-box-header">
                  <span className="turn-badge user-turn-badge">
                    [Lượt {turn.turnIndex}] Khách hàng đã hỏi
                  </span>
                  <span className="turn-timestamp">
                    {new Date(turn.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="turn-user-content">&ldquo;{turn.userMessage}&rdquo;</div>
              </div>

              <div className="turn-assistant-box">
                <div className="turn-box-header">
                  <div className="turn-model-group">
                    <span className="turn-badge assistant-turn-badge">Nghệ nhân MORI phản hồi</span>
                    <span className={`log-model-badge ${modelClass}`}>{turn.modelUsed}</span>
                    <span className="log-tier-badge">Tier {turn.fallbackTier}</span>
                    <span className="log-latency">{(turn.latencyMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
                <div className="turn-reply-content">{turn.assistantReply}</div>

                {turn.suggestedProducts && turn.suggestedProducts.length > 0 && (
                  <div className="turn-suggested-products">
                    <span className="suggested-label">Mẫu thiệp đã giới thiệu kèm:</span>
                    <div className="suggested-chips">
                      {turn.suggestedProducts.map((p) => (
                        <a
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="product-chip-link"
                        >
                          <strong>{p.name}</strong> ({p.startingPriceVnd}) &rarr;
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
