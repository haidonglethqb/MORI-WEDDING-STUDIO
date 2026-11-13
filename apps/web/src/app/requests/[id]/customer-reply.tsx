'use client'

import { useRef, useState } from 'react'

export function CustomerReply({ requestId }: { requestId: string }) {
  const key = useRef(`customer-${crypto.randomUUID()}`)
  const [plainText, setPlainText] = useState('')
  const [status, setStatus] = useState('')

  async function send() {
    setStatus('Đang gửi')
    const response = await fetch(`/requests/${requestId}/reply`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ plainText }),
    })
    if (!response.ok) {
      setStatus('Chưa gửi được.')
      return
    }
    key.current = `customer-${crypto.randomUUID()}`
    setPlainText('')
    setStatus('Đã gửi. Tải lại để thấy tin.')
  }

  return (
    <form
      className="atelier-reply"
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <label className="atelier-field">
        <span>Tin nhắn cho xưởng</span>
        <textarea
          value={plainText}
          placeholder="Chia sẻ mong muốn về màu sắc, chất liệu, nội dung in…"
          onChange={(event) => setPlainText(event.target.value)}
        />
      </label>
      <div className="atelier-form-actions">
        <p className="atelier-hint" role="status" aria-live="polite">{status || 'Xưởng thường phản hồi trong giờ làm việc.'}</p>
        <button type="submit" className="workspace-btn-primary" disabled={!plainText.trim()}>Gửi tin nhắn</button>
      </div>
    </form>
  )
}
