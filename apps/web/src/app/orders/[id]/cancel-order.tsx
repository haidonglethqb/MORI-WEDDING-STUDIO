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
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <h2>Yêu cầu hủy</h2>
      <label>
        Lý do
        <input value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <button type="submit">Gửi yêu cầu hủy</button>
      {status ? <p>{status}</p> : null}
    </form>
  )
}
