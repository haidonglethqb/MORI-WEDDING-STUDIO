'use client'

import { useState } from 'react'

export function IssueQuote({ requestId }: { requestId: string }) {
  const [total, setTotal] = useState('')
  const [shipping, setShipping] = useState('')
  const [tax, setTax] = useState('')
  const [scope, setScope] = useState('')
  const [status, setStatus] = useState('Số tiền là mẫu thử, chưa phải bảng giá thật.')

  async function issue() {
    setStatus('Đang phát hành')
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
    setStatus(response.ok ? 'Đã phát hành báo giá mẫu thử.' : 'Chưa phát hành được.')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void issue()
      }}
    >
      <h2>Báo giá mẫu thử</h2>
      <label>
        Tổng VND
        <input value={total} onChange={(event) => setTotal(event.target.value)} />
      </label>
      <label>
        Phí giao VND
        <input value={shipping} onChange={(event) => setShipping(event.target.value)} />
      </label>
      <label>
        Thuế VND
        <input value={tax} onChange={(event) => setTax(event.target.value)} />
      </label>
      <label>
        Mã phạm vi
        <input value={scope} onChange={(event) => setScope(event.target.value)} />
      </label>
      <button type="submit">Phát hành</button>
      <p>{status}</p>
    </form>
  )
}
