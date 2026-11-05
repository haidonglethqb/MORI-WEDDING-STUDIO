'use client'

import { useState } from 'react'

export function IssueQuote({ requestId }: { requestId: string }) {
  const [total, setTotal] = useState('')
  const [shipping, setShipping] = useState('')
  const [tax, setTax] = useState('')
  const [scope, setScope] = useState('')
  const [status, setStatus] = useState('Dự toán thử nghiệm được tạo phục vụ kiểm thử hệ thống.')

  async function issue() {
    setStatus('Đang phát hành dự toán...')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const response = await fetch(`/studio/requests/${requestId}/quote`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        totalAmountVnd: total.trim(),
        shippingAmountVnd: shipping.trim(),
        taxAmountVnd: tax.trim(),
        scopeFingerprint: scope.trim(),
        expiresAt,
        isFixture: true,
      }),
    })
    setStatus(response.ok ? 'Đã phát hành báo giá thành công.' : 'Chưa phát hành được báo giá.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void issue()
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <input
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Tổng VND..."
          value={total}
          onChange={(event) => setTotal(event.target.value)}
        />
        <input
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Phí giao..."
          value={shipping}
          onChange={(event) => setShipping(event.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <input
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Thuế VND..."
          value={tax}
          onChange={(event) => setTax(event.target.value)}
        />
        <input
          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d8d4c9', fontSize: '13px' }}
          placeholder="Mã phạm vi..."
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        />
      </div>
      <button type="submit" className="workspace-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
        Phát hành báo giá
      </button>
      <div style={{ fontSize: '12px', color: '#7a8275', marginTop: '6px' }}>{status}</div>
    </form>
  )
}
