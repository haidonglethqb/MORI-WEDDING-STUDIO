'use client'

import { useEffect, useState } from 'react'

export interface LogEntry {
  id: string
  timestamp: string
  userMessage: string
  modelUsed: string
  fallbackTier: number
  latencyMs: number
  assistantReply: string
  suggestedProducts: Array<{
    slug: string
    name: string
    startingPriceVnd: string
  }>
  extractedContext?: {
    coupleNames?: string | null
    weddingDate?: string | null
    location?: string | null
    guestCount?: number | null
    budget?: string | null
  }
}

export function AdminAiLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch('/admin/ai/logs', { cache: 'no-store' })
      if (res.ok) {
        const data = (await res.json()) as LogEntry[]
        setLogs(data)
        if (data.length > 0 && !expandedId) {
          setExpandedId(data[0]?.id ?? null)
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký hội thoại AI không?')) return
    try {
      await fetch('/admin/ai/logs', { method: 'DELETE' })
      setLogs([])
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    void fetchLogs()
  }, [])

  const filtered = logs.filter(
    (l) =>
      l.userMessage.toLowerCase().includes(search.toLowerCase()) ||
      l.assistantReply.toLowerCase().includes(search.toLowerCase()) ||
      l.modelUsed.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="admin-logs-container">
      <div className="logs-toolbar">
        <input
          type="text"
          className="logs-search-input"
          placeholder="Tìm kiếm nội dung khách nhắn, phản hồi hoặc tên model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="logs-actions">
          <button type="button" className="btn-secondary-sm" onClick={() => void fetchLogs()}>
            {loading ? 'Đang tải...' : '✦ Làm mới'}
          </button>
          <button type="button" className="btn-danger-sm" onClick={() => void handleClear()} disabled={logs.length === 0}>
            Xóa lịch sử
          </button>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="logs-empty">Đang tải nhật ký hội thoại AI...</div>
      ) : filtered.length === 0 ? (
        <div className="logs-empty">
          {logs.length === 0
            ? 'Chưa có nhật ký nào. Mọi câu hỏi của khách hàng trên trang Trợ lý sẽ tự động lưu lại tại đây.'
            : 'Không tìm thấy lượt trò chuyện nào khớp với từ khóa.'}
        </div>
      ) : (
        <div className="logs-list">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id
            const isCodex = log.modelUsed.includes('sol') || log.modelUsed.includes('codex')
            const isGroq = log.modelUsed.includes('groq') || log.modelUsed.includes('oss')

            return (
              <div key={log.id} className={`log-card ${isExpanded ? 'is-expanded' : ''}`}>
                <div
                  className="log-card-header"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="log-header-left">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                      · {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`log-model-badge ${isCodex ? 'is-codex' : isGroq ? 'is-groq' : 'is-local'}`}>
                      {log.modelUsed}
                    </span>
                    <span className="log-tier-badge">Tier {log.fallbackTier}</span>
                    <span className="log-latency">{(log.latencyMs / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="log-header-right">
                    <span className="log-toggle-icon">{isExpanded ? '▲ Thu gọn' : '▼ Chi tiết'}</span>
                  </div>
                </div>

                <div className="log-snippet-preview">
                  <span className="snippet-user-label">Khách:</span> &ldquo;{log.userMessage}&rdquo;
                </div>

                {isExpanded && (
                  <div className="log-card-details">
                    <div className="detail-block user-block">
                      <div className="detail-title">Khách hàng đã hỏi:</div>
                      <div className="detail-content user-text">{log.userMessage}</div>
                    </div>

                    <div className="detail-block reply-block">
                      <div className="detail-title">
                        Nghệ nhân MORI đã phản hồi <span className="model-sub">({log.modelUsed})</span>:
                      </div>
                      <div className="detail-content reply-text">{log.assistantReply}</div>
                    </div>

                    {log.suggestedProducts.length > 0 && (
                      <div className="detail-block products-block">
                        <div className="detail-title">Thẻ tác phẩm đã gợi ý kèm theo:</div>
                        <div className="products-tag-list">
                          {log.suggestedProducts.map((p) => (
                            <span key={p.slug} className="product-chip">
                              <strong>{p.name}</strong> ({p.startingPriceVnd})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.extractedContext && (
                      <div className="detail-block context-block">
                        <div className="detail-title">Thông tin tiệc cưới hệ thống ghi nhớ:</div>
                        <div className="context-chips-row">
                          {log.extractedContext.coupleNames && (
                            <span className="ctx-chip">Cặp đôi: {log.extractedContext.coupleNames}</span>
                          )}
                          {log.extractedContext.location && (
                            <span className="ctx-chip">Địa điểm: {log.extractedContext.location}</span>
                          )}
                          {log.extractedContext.guestCount && (
                            <span className="ctx-chip">Khách: {log.extractedContext.guestCount} người</span>
                          )}
                          {log.extractedContext.budget && (
                            <span className="ctx-chip">Ngân sách: {Number(log.extractedContext.budget).toLocaleString('vi-VN')} ₫</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
