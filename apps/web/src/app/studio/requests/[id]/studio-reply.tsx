'use client'

import { useRef, useState } from 'react'

export function StudioReply({ requestId }: { requestId: string }) {
  const key = useRef(`reply-${crypto.randomUUID()}`)
  const [plainText, setPlainText] = useState('')
  const [internal, setInternal] = useState(true)
  const [status, setStatus] = useState('')

  async function send() {
    if (!plainText.trim()) return
    setStatus('Đang gửi tin nhắn...')
    const response = await fetch(`/studio/requests/${requestId}/reply`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': key.current },
      body: JSON.stringify({ plainText: plainText.trim(), visibility: internal ? 'INTERNAL' : 'CUSTOMER' }),
    })
    if (!response.ok) {
      setStatus('Chưa gửi được tin nhắn.')
      return
    }
    key.current = `reply-${crypto.randomUUID()}`
    setPlainText('')
    setStatus('Đã gửi phản hồi thành công. Tải lại trang để cập nhật.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <textarea
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d8d4c9', fontSize: '13px', minHeight: '80px', fontFamily: 'inherit' }}
          placeholder="Nhập nội dung phản hồi hoặc ghi chú..."
          value={plainText}
          onChange={(event) => setPlainText(event.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5247', cursor: 'pointer' }}>
          <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
          Chỉ lưu nội bộ xưởng (khách không thấy)
        </label>
        <button type="submit" className="workspace-btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
          Gửi tin
        </button>
      </div>
      {status ? <div style={{ fontSize: '12px', color: '#3e4a39', marginTop: '6px' }}>{status}</div> : null}
    </form>
  )
}
