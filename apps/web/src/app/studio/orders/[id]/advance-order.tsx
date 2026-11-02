'use client'

import { useState } from 'react'

export function AdvanceOrder({ orderId, track, label }: { orderId: string; track: 'physical' | 'digital'; label: string }) {
  const [status, setStatus] = useState('')

  async function advance() {
    setStatus('Đang cập nhật')
    const response = await fetch(`/studio/orders/${orderId}/advance`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ track }),
    })
    setStatus(response.ok ? 'Đã sang bước tiếp.' : 'Chưa sang được bước tiếp.')
  }

  return (
    <p>
      <button type="button" onClick={() => void advance()}>
        {label}
      </button>
      {status ? <span> {status}</span> : null}
    </p>
  )
}
