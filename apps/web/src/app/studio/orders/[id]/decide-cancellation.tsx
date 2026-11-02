'use client'

import { useState } from 'react'

export function DecideCancellation({ orderId, cancellationId }: { orderId: string; cancellationId: string }) {
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')

  async function decide(approve: boolean) {
    setStatus('Đang ghi quyết định')
    const response = await fetch(`/studio/orders/${orderId}/cancellations/${cancellationId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ approve, reason }),
    })
    setStatus(response.ok ? 'Đã ghi quyết định.' : 'Chưa ghi được quyết định.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <label>
        Lý do xưởng
        <input value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <button type="button" onClick={() => void decide(true)}>
        Chấp nhận hủy
      </button>
      <button type="button" onClick={() => void decide(false)}>
        Giữ đơn
      </button>
      {status ? <span> {status}</span> : null}
    </form>
  )
}
