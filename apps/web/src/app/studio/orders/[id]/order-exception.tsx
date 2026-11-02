'use client'

import { useState } from 'react'

export function OrderException({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('Lý do tạm dừng khách có thể đọc trên đơn.')

  async function send(kind: 'hold' | 'quality' | 'shipment') {
    setStatus('Đang ghi')
    const response = await fetch(`/studio/orders/${orderId}/exceptions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, reason }),
    })
    setStatus(response.ok ? 'Đã ghi.' : 'Chưa ghi được. Kiểm tra bước đơn hiện tại.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void send('hold')
      }}
    >
      <h2>Sự cố</h2>
      <label>
        Lý do
        <input value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <button type="submit">Tạm dừng</button>
      <button type="button" onClick={() => void send('quality')}>
        Lỗi kiểm tra
      </button>
      <button type="button" onClick={() => void send('shipment')}>
        Sự cố giao hàng
      </button>
      <p>{status}</p>
    </form>
  )
}
