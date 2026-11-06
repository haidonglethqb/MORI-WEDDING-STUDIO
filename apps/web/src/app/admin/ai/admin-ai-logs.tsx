'use client'

import { useEffect, useState } from 'react'
import type { AiConversationSession } from './admin-ai-types'
import { AdminAiSessionView } from './admin-ai-session-view'

export function AdminAiLogs() {
  const [sessions, setSessions] = useState<AiConversationSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchSessions() {
    setLoading(true)
    try {
      const res = await fetch('/admin/ai/logs', { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as AiConversationSession[]
        setSessions(data)
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0]?.sessionId ?? null)
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleClearAll() {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các phiên trò chuyện AI không?')) return
    try {
      await fetch('/admin/ai/logs', { method: 'DELETE' })
      setSessions([])
      setSelectedId(null)
    } catch {
      // Ignore
    }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiên hội thoại ${sessionId}?`)) return
    try {
      const res = await fetch(`/admin/ai/logs/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const nextList = sessions.filter((s) => s.sessionId !== sessionId)
        setSessions(nextList)
        if (selectedId === sessionId) {
          setSelectedId(nextList[0]?.sessionId ?? null)
        }
      }
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    void fetchSessions()
  }, [])

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase()
    if (s.sessionId.toLowerCase().includes(q)) return true
    if (s.brief.coupleNames?.toLowerCase().includes(q)) return true
    if (s.brief.location?.toLowerCase().includes(q)) return true
    if (s.lastModelUsed.toLowerCase().includes(q)) return true
    return s.turns.some(
      (t) =>
        t.userMessage.toLowerCase().includes(q) ||
        t.assistantReply.toLowerCase().includes(q) ||
        t.modelUsed.toLowerCase().includes(q),
    )
  })

  const currentSession = sessions.find((s) => s.sessionId === selectedId) ?? filtered[0]

  return (
    <div className="admin-sessions-container">
      <div className="sessions-toolbar">
        <input
          type="text"
          className="logs-search-input"
          placeholder="Tìm theo mã phiên, tên cặp đôi, câu hỏi khách nhắn hoặc model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="logs-actions">
          <button type="button" className="btn-secondary-sm" onClick={() => void fetchSessions()}>
            {loading ? 'Đang tải...' : '✦ Làm mới'}
          </button>
          <button
            type="button"
            className="btn-danger-sm"
            onClick={() => void handleClearAll()}
            disabled={sessions.length === 0}
          >
            Xóa tất cả ({sessions.length})
          </button>
        </div>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="logs-empty">Đang tải danh sách các phiên trò chuyện của khách...</div>
      ) : filtered.length === 0 ? (
        <div className="logs-empty">
          {sessions.length === 0
            ? 'Chưa có phiên trò chuyện nào. Mỗi khi khách nhắn tin với Trợ lý MORI, phiên chat và context riêng biệt sẽ tự động hiển thị tại đây.'
            : 'Không tìm thấy phiên hội thoại nào khớp với từ khóa.'}
        </div>
      ) : (
        <div className="sessions-master-detail-layout">
          <div className="sessions-master-list">
            <div className="master-list-header">
              <span>Danh sách cuộc trò chuyện ({filtered.length})</span>
            </div>
            {filtered.map((s) => {
              const isSelected = (currentSession?.sessionId ?? '') === s.sessionId
              const lastTurn = s.turns[s.turns.length - 1]
              const previewText = lastTurn?.userMessage || 'Chưa có tin nhắn'
              const coupleName = s.brief.coupleNames || null

              return (
                <div
                  key={s.sessionId}
                  className={`session-summary-card ${isSelected ? 'is-active' : ''}`}
                  onClick={() => setSelectedId(s.sessionId)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="summary-card-top">
                    <span className="summary-session-id">{s.sessionId}</span>
                    <span className="summary-turn-count">{s.turnsCount} lượt</span>
                  </div>

                  {coupleName && (
                    <div className="summary-couple-tag">
                      ✦ Cặp đôi: <strong>{coupleName}</strong>
                    </div>
                  )}

                  <div className="summary-preview-message">&ldquo;{previewText}&rdquo;</div>

                  <div className="summary-card-bottom">
                    <span className="summary-model-pill">{s.lastModelUsed}</span>
                    <span className="summary-time">
                      {new Date(s.updatedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="sessions-detail-column">
            {currentSession ? (
              <AdminAiSessionView
                session={currentSession}
                onDeleteSession={handleDeleteSession}
              />
            ) : (
              <div className="no-session-selected">Vui lòng chọn một phiên hội thoại từ danh sách bên trái.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
