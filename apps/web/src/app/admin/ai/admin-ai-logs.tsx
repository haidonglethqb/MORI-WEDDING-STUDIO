'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminAiSessionView } from './admin-ai-session-view'
import type { AiConversationSession } from './admin-ai-types'
import { AdminSessionCard } from './admin-session-card'

function isSessionEscalated(s: AiConversationSession): boolean {
  return Boolean(
    s.needsHumanSupport || s.needsHuman || s.escalated || s.customerContact || s.contactInfo,
  )
}

function normalizeSessionsPayload(raw: unknown): AiConversationSession[] {
  if (Array.isArray(raw)) return raw as AiConversationSession[]
  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as { sessions?: unknown }).sessions)) {
    return (raw as { sessions: AiConversationSession[] }).sessions
  }
  return []
}

export function AdminAiLogs() {
  const [sessions, setSessions] = useState<AiConversationSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [onlyEscalated, setOnlyEscalated] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/admin/ai/logs', { cache: 'no-store' })
      if (res.ok) {
        const data = normalizeSessionsPayload((await res.json()) as unknown)
        setSessions(data)
        setSelectedId((prev) => prev ?? data[0]?.sessionId ?? null)
      }
    } catch {
      // Ignore transient errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

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
        if (selectedId === sessionId) setSelectedId(nextList[0]?.sessionId ?? null)
      }
    } catch {
      // Ignore
    }
  }

  const escalatedCount = sessions.filter(isSessionEscalated).length
  const filtered = sessions.filter((s) => {
    if (onlyEscalated && !isSessionEscalated(s)) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      s.sessionId.toLowerCase().includes(q) ||
      Boolean(s.brief.coupleNames?.toLowerCase().includes(q)) ||
      Boolean(s.customerContact?.toLowerCase().includes(q)) ||
      Boolean(s.contactInfo?.toLowerCase().includes(q)) ||
      s.turns.some(
        (t) => t.userMessage.toLowerCase().includes(q) || t.assistantReply.toLowerCase().includes(q),
      )
    )
  })

  const currentSession = filtered.find((s) => s.sessionId === selectedId) ?? filtered[0]

  return (
    <div className="admin-sessions-container">
      <div className="sessions-toolbar">
        <input
          type="text"
          className="logs-search-input"
          placeholder="Tìm theo mã phiên, SĐT/email khách, tên cặp đôi hoặc nội dung chat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="logs-actions">
          <button
            type="button"
            className={`btn-filter-sm ${onlyEscalated ? 'is-active' : ''}`}
            onClick={() => setOnlyEscalated((prev) => !prev)}
          >
            Cần nhân viên hỗ trợ ({escalatedCount})
          </button>
          <button type="button" className="btn-secondary-sm" onClick={() => void fetchSessions()}>
            {loading ? 'Đang tải...' : 'Làm mới'}
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
            ? 'Chưa có phiên trò chuyện nào. Khi khách nhắn với Trợ lý MORI hoặc bấm “Gặp nhân viên tư vấn”, phiên hội thoại sẽ tự động hiển thị tại đây.'
            : 'Không tìm thấy phiên hội thoại nào phù hợp bộ lọc.'}
        </div>
      ) : (
        <div className="sessions-master-detail-layout">
          <div className="sessions-master-list">
            <div className="master-list-header">
              <span>Danh sách cuộc trò chuyện ({filtered.length})</span>
            </div>
            {filtered.map((s) => (
              <AdminSessionCard
                key={s.sessionId}
                session={s}
                isSelected={(currentSession?.sessionId ?? '') === s.sessionId}
                isEscalated={isSessionEscalated(s)}
                onSelect={setSelectedId}
              />
            ))}
          </div>

          <div className="sessions-detail-column">
            {currentSession ? (
              <AdminAiSessionView
                session={currentSession}
                onDeleteSession={handleDeleteSession}
                onSessionUpdated={fetchSessions}
              />
            ) : (
              <div className="no-session-selected">
                Vui lòng chọn một phiên hội thoại từ danh sách bên trái.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
