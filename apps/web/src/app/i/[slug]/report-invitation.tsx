'use client'

import { useState } from 'react'

export function ReportInvitation({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')

  async function submit() {
    const trimmed = reason.trim()
    if (trimmed.length < 3) {
      setStatus('Nhập lý do tối thiểu 3 ký tự.')
      return
    }
    setStatus('Đang gửi')
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
      setStatus('Chưa gửi được báo cáo.')
      return
    }
    setReason('')
    setOpen(false)
    setStatus('Đã ghi nhận báo cáo.')
  }

  return (
    <footer className="guest-report">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}>
          Báo cáo thiệp này
        </button>
      ) : (
        <div>
          <label>
            Lý do báo cáo
            <input
              value={reason}
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => void submit()}>
            Gửi báo cáo
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Đóng
          </button>
        </div>
      )}
      {status ? <p>{status}</p> : null}
    </footer>
  )
}
