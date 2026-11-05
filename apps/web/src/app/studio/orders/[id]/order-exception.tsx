'use client'

import { useState } from 'react'

export function OrderException({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('Lý do tạm dừng khách hàng có thể theo dõi trực tiếp trên trang đơn hàng.')

  async function send(kind: 'hold' | 'quality' | 'shipment') {
    setStatus('Đang ghi nhận sự cố...')
    const response = await fetch(`/studio/orders/${orderId}/exceptions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, reason }),
    })
    setStatus(response.ok ? 'Đã ghi nhận sự cố thành công.' : 'Chưa ghi được sự cố. Kiểm tra công đoạn đơn hàng.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void send('hold')
      }}
    >
      <div className="workspace-section-head">
        <h2>Báo cáo sự cố &amp; Tạm giữ</h2>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <input
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Nhập chi tiết sự cố hoặc lý do tạm hoãn..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="workspace-btn-outline"
          style={{ color: '#9b1c1c', borderColor: '#f8b4b4', fontSize: '12px', padding: '6px 12px' }}
        >
          Tạm dừng đơn
        </button>
        <button
          type="button"
          className="workspace-btn-outline"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          onClick={() => void send('quality')}
        >
          Lỗi kiểm định chất lượng
        </button>
        <button
          type="button"
          className="workspace-btn-outline"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          onClick={() => void send('shipment')}
        >
          Sự cố vận chuyển
        </button>
      </div>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '8px' }}>{status}</div>
    </form>
  )
}
