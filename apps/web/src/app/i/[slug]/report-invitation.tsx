'use client'

import { useState } from 'react'

export function ReportInvitation({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')

  async function submit() {
    const trimmed = reason.trim()
    if (trimmed.length < 3) {
      setStatus('Vui lòng nhập lý do tối thiểu 3 ký tự.')
      return
    }
    setStatus('Đang gửi phản hồi...')
    const response = await fetch(`/i/${encodeURIComponent(slug)}/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: trimmed }),
    })
    if (response.status === 429) {
      setStatus('Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau.')
      return
    }
    if (!response.ok) {
      setStatus('Chưa gửi được báo cáo kiểm duyệt.')
      return
    }
    setReason('')
    setOpen(false)
    setStatus('Đã ghi nhận báo cáo. Đội ngũ kiểm duyệt sẽ xem xét.')
  }

  return (
    <footer className="guest-report">
      {!open ? (
        <button
          type="button"
          className="guest-report-trigger"
          onClick={() => setOpen(true)}
        >
          Báo cáo nội dung thiệp không phù hợp
        </button>
      ) : (
        <div className="guest-report-panel">
          <label>
            Lý do báo cáo vi phạm
            <input
              value={reason}
              maxLength={500}
              placeholder="VD: Thông tin không chính xác hoặc nội dung không phù hợp..."
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="guest-report-actions">
            <button
              type="button"
              className="rsvp-btn-no"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="rsvp-btn-yes"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => void submit()}
            >
              Gửi báo cáo
            </button>
          </div>
        </div>
      )}
      {status ? <p className="guest-rsvp-status">{status}</p> : null}
    </footer>
  )
}
