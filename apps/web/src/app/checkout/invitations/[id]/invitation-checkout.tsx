'use client'

import type { ConfirmInvitationDemoPayment, InvitationDemoPaymentDetails } from '@mori/contracts'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'

type PaymentMethod = ConfirmInvitationDemoPayment['method']

const methods: { id: PaymentMethod; label: string }[] = [
  { id: 'MOMO', label: 'MoMo' },
  { id: 'VNPAY', label: 'VNPAY' },
  { id: 'BANK_QR', label: 'Bank QR' },
]

export function InvitationCheckout({
  id,
  names,
  payment,
}: {
  id: string
  names: [string, string]
  payment: InvitationDemoPaymentDetails
}) {
  const [method, setMethod] = useState<PaymentMethod>('MOMO')
  const [receipt, setReceipt] = useState(payment)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const response = await fetch(`/checkout/invitations/${id}/demo-payment`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method }),
      })
      if (!response.ok) throw new Error(`Payment confirmation failed (${response.status})`)
      setReceipt((await response.json()) as InvitationDemoPaymentDetails)
    } catch {
      setError('Chưa xác nhận được thanh toán demo. Bạn thử lại nhé.')
    } finally {
      setBusy(false)
    }
  }

  const editorUrl = `/invitations/${id}`
  const amount = `${new Intl.NumberFormat('vi-VN').format(BigInt(receipt.amountVnd))} ₫`

  if (receipt.method) {
    return (
      <section className="checkout-success-card" aria-live="polite">
        <h2>Đã xác nhận thanh toán demo</h2>
        <p>Đã ghi nhận thanh toán demo cho thiệp của {names.join(' & ')}. Quay lại bản nháp để xuất bản và lấy link chia sẻ.</p>
        <div className="checkout-success-actions">
          <a href={editorUrl} className="checkout-track-btn">Về bản nháp để xuất bản</a>
        </div>
      </section>
    )
  }

  return (
    <form className="checkout-grid" onSubmit={(event) => void confirm(event)}>
      <section className="checkout-card" aria-labelledby="demo-payment-methods">
        <h2 id="demo-payment-methods">Chọn phương thức mô phỏng</h2>
        <div className="payment-method-list">
          {methods.map((option) => (
            <label key={option.id} className={`payment-option-card${method === option.id ? ' active' : ''}`}>
              <input type="radio" name="method" value={option.id} checked={method === option.id}
                onChange={() => setMethod(option.id)} disabled={busy} />
              <strong>{option.label}</strong>
            </label>
          ))}
        </div>
      </section>
      <section className="checkout-summary-card" aria-labelledby="demo-payment-summary">
        <h2 id="demo-payment-summary">Thiệp online của {names.join(' & ')}</h2>
        <p className="checkout-sum-total"><span>Số tiền mô phỏng</span><strong>{amount}</strong></p>
        {error ? <p className="checkout-error" role="alert">{error}</p> : null}
        <button type="submit" className="checkout-submit-btn" disabled={busy}>
          {busy ? 'Đang xác nhận…' : 'Xác nhận thanh toán demo'}
        </button>
        <div className="checkout-success-actions">
          <Link href={editorUrl} className="checkout-back-btn">Quay lại bản nháp</Link>
        </div>
      </section>
    </form>
  )
}
