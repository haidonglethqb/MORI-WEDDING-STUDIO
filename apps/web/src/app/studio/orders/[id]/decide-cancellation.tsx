'use client'

import { useState } from 'react'

export function DecideCancellation({ orderId, cancellationId }: { orderId: string; cancellationId: string }) {
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')

  async function decide(approve: boolean) {
    setStatus('Đang ghi nhận quyết định...')
    const response = await fetch(`/studio/orders/${orderId}/cancellations/${cancellationId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ approve, reason }),
    })
    setStatus(response.ok ? 'Đã ghi nhận quyết định thành công.' : 'Chưa ghi nhận được quyết định.')
  }

  return (
    <form
      style={{ marginTop: '8px' }}
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <input
          style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Lý do xưởng (tùy chọn)..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="workspace-btn-outline"
          style={{ color: '#9b1c1c', borderColor: '#f8b4b4', fontSize: '12px', padding: '6px 12px' }}
          onClick={() => void decide(true)}
        >
          Chấp nhận hủy đơn
        </button>
        <button
          type="button"
          className="workspace-btn-outline"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          onClick={() => void decide(false)}
        >
          Giữ đơn tiếp tục
        </button>
      </div>
      {status ? <div style={{ fontSize: '12px', color: '#3e4a39', marginTop: '6px' }}>{status}</div> : null}
    </form>
  )
}
