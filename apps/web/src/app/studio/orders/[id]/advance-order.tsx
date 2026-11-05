'use client'

import { useState } from 'react'

export function AdvanceOrder({
  orderId,
  track,
  label,
}: {
  orderId: string
  track: 'physical' | 'digital'
  label: string
}) {
  const [status, setStatus] = useState('')

  async function advance() {
    setStatus('Đang cập nhật công đoạn...')
    const response = await fetch(`/studio/orders/${orderId}/advance`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ track }),
    })
    setStatus(response.ok ? 'Đã chuyển sang công đoạn tiếp theo thành công.' : 'Chưa chuyển được công đoạn.')
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        className="workspace-btn-primary"
        style={{ fontSize: '13px', padding: '8px 16px' }}
        onClick={() => void advance()}
      >
        {label}
      </button>
      {status ? <div style={{ fontSize: '12px', color: '#3e4a39', marginTop: '6px' }}>{status}</div> : null}
    </div>
  )
}
