'use client'

import Link from 'next/link'
import { useState } from 'react'

interface EscalatePanelProps {
  escalated: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (contact: string, note: string) => Promise<boolean>
  onClose: () => void
}

export function AssistantEscalatePanel({
  escalated,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: EscalatePanelProps) {
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!contact.trim()) {
      setLocalError('Bạn vui lòng nhập số điện thoại hoặc email để nhân viên MORI phản hồi nhé.')
      return
    }
    setLocalError(null)
    const ok = await onSubmit(contact.trim(), note.trim())
    if (ok) {
      setNote('')
      onClose()
    }
  }

  return (
    <form className="escalate-drawer" onSubmit={(e) => void handleFormSubmit(e)}>
      <div className="escalate-drawer-head">
        <div>
          <strong>Chuyển cuộc trò chuyện tới nhân viên tư vấn MORI</strong>
          <p>
            Nhân viên Admin sẽ xem toàn bộ đoạn chat và trả lời trực tiếp tại khung chat này hoặc
            liên hệ qua SĐT/Email của bạn.
          </p>
        </div>
        <button type="button" className="escalate-close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>

      <div className="escalate-fields-row">
        <label className="escalate-field">
          <span>Số điện thoại hoặc Email *</span>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Ví dụ: 0901234567 hoặc tenban@gmail.com"
            disabled={submitting}
          />
        </label>
        <label className="escalate-field">
          <span>Nội dung cần tư vấn thêm</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Muốn thiết kế riêng màu xanh olive hoặc duyệt mẫu gấp..."
            disabled={submitting}
          />
        </label>
      </div>

      {(localError || errorMessage) && (
        <div className="escalate-error-msg" role="alert">
          {localError || errorMessage}
        </div>
      )}

      <div className="escalate-drawer-actions">
        <span className="escalate-alt-hint">
          Hoặc gửi{' '}
          <Link href="/collections?tab=custom" className="escalate-alt-link">
            yêu cầu thiết kế riêng tại MORI
          </Link>
        </span>
        <button type="submit" className="escalate-submit-btn" disabled={submitting}>
          {submitting
            ? 'Đang gửi yêu cầu...'
            : escalated
              ? 'Cập nhật liên hệ cho nhân viên'
              : 'Gửi yêu cầu gặp nhân viên'}
        </button>
      </div>
    </form>
  )
}
