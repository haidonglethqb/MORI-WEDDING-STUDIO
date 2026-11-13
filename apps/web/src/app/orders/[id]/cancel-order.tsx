'use client'

import { useRef, useState } from 'react'

export function CancelOrder({ orderId }: { orderId: string }) {
  const key = useRef(`cancel-${crypto.randomUUID()}`)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')

  async function submit() {
    setStatus('Đang gửi')
    const response = await fetch(`/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': key.current,
      },
      body: JSON.stringify({ reason }),
    })
    setStatus(response.ok ? 'Đã gửi yêu cầu hủy. Xưởng sẽ xem xét.' : 'Chưa gửi được yêu cầu hủy.')
  }

  return (
    <form
      className="order-card-section atelier-form"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h2 className="order-card-title">Yêu cầu hủy đơn</h2>
      <p className="atelier-hint">Xưởng sẽ xem xét dựa trên công đoạn hiện tại của đơn.</p>
      <label className="atelier-field">
        <span>Lý do hủy</span>
        <input value={reason} placeholder="vd: Thay đổi ngày cưới" onChange={(event) => setReason(event.target.value)} />
      </label>
      <div className="atelier-form-actions">
        <button type="submit" className="workspace-btn-outline atelier-danger">Gửi yêu cầu hủy</button>
      </div>
      {status ? <p className="atelier-hint" role="status">{status}</p> : null}
    </form>
  )
}
