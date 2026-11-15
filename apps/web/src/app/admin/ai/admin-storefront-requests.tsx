'use client'

import { useState } from 'react'
import type { CustomRequestRecord } from './admin-ai-types'

interface RequestsProps {
  requests: CustomRequestRecord[]
  onReload: () => Promise<void>
}

const REQUEST_STATUS_OPTIONS = [
  { key: 'NEW', label: 'Mới tiếp nhận' },
  { key: 'CONTACTED', label: 'Đã liên hệ & tư vấn' },
  { key: 'DONE', label: 'Đã hoàn thành' },
]

export function AdminStorefrontRequests({ requests, onReload }: RequestsProps) {
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  async function handleSaveRequest(req: CustomRequestRecord) {
    setSavingId(req.id)
    setFeedback((prev) => ({ ...prev, [req.id]: '' }))
    try {
      const nextStatus = statuses[req.id] ?? req.status
      const nextNote = notes[req.id] ?? req.adminNote
      const res = await fetch(`/api/storefront/custom-requests/${encodeURIComponent(req.id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, adminNote: nextNote }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setFeedback((prev) => ({ ...prev, [req.id]: '✓ Đã cập nhật yêu cầu thiết kế riêng.' }))
      await onReload()
    } catch {
      setFeedback((prev) => ({ ...prev, [req.id]: '✕ Không thể cập nhật yêu cầu này.' }))
    } finally {
      setSavingId(null)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="logs-empty">
        Chưa có yêu cầu thiết kế thiệp riêng nào gửi từ website.
      </div>
    )
  }

  return (
    <div className="inbox-cards-stack">
      {requests.map((req) => (
        <article key={req.id} className="inbox-record-card">
          <div className="inbox-card-top">
            <div>
              <span className="inbox-code-badge">#{req.id.slice(0, 8)}</span>
              <strong className="inbox-customer-name">{req.customerName}</strong>
              <span className="inbox-contact-pill">{req.contact}</span>
              {req.email && <span className="inbox-contact-pill">{req.email}</span>}
            </div>
            {req.fontCode && <span className="inbox-type-badge">Font: {req.fontCode}</span>}
          </div>

          <div className="inbox-summary-grid">
            <div>
              <span className="inbox-meta-label">Ý tưởng / Ghi chú khách hàng</span>
              <p>
                {req.coupleNames ? `${req.coupleNames} · ` : ''}
                {req.style ? `${req.style} · ` : ''}
                {req.styleNote}
              </p>
            </div>
            <div>
              <span className="inbox-meta-label">Số lượng &amp; Ngày cưới</span>
              <p>
                {req.quantity}
                {req.weddingDate ? ` · ${req.weddingDate}` : ''}
              </p>
            </div>
          </div>

          <div className="inbox-controls-grid">
            <label className="inbox-field">
              <span>Trạng thái xử lý</span>
              <select
                value={statuses[req.id] ?? req.status}
                onChange={(e) => setStatuses((prev) => ({ ...prev, [req.id]: e.target.value }))}
              >
                {REQUEST_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="inbox-field">
              <span>Ghi chú nội bộ / Báo giá từ MORI</span>
              <input
                type="text"
                placeholder="Đã gửi bản 2D cho khách qua chat tư vấn / email..."
                value={notes[req.id] ?? req.adminNote}
                onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
              />
            </label>
          </div>

          {feedback[req.id] && <div className="inbox-feedback-line">{feedback[req.id]}</div>}

          <div className="inbox-card-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={savingId === req.id}
              onClick={() => void handleSaveRequest(req)}
            >
              {savingId === req.id ? 'Đang lưu...' : 'Lưu trạng thái thiết kế'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
