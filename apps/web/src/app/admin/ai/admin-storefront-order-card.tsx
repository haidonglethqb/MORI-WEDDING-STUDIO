'use client'

import { useState } from 'react'
import {
  ONLINE_TRACK_STEPS,
  PAPER_TRACK_STEPS,
  formatVndAmount,
} from '../../order-tracking/order-tracking-types'
import type { StorefrontOrderRecord } from './admin-ai-types'

interface OrderCardProps {
  order: StorefrontOrderRecord
  onReload: () => Promise<void>
}

export function AdminStorefrontOrderCard({ order, onReload }: OrderCardProps) {
  const showPaper = order.orderType === 'PAPER' || order.orderType === 'COMBO'
  const showOnline = order.orderType === 'DIGITAL' || order.orderType === 'COMBO'

  const [paperStep, setPaperStep] = useState<number>(order.paperStepIndex ?? 0)
  const [onlineStep, setOnlineStep] = useState<number>(order.onlineStepIndex ?? 0)
  const [paidAmountVnd, setPaidAmountVnd] = useState(order.paidAmountVnd)
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleSave() {
    setSaving(true)
    setFeedback('')
    const cleanDigits = paidAmountVnd.replace(/[^\d]/g, '') || '0'
    try {
      const res = await fetch(`/api/storefront/orders/${encodeURIComponent(order.orderCode)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(showPaper ? { paperStepIndex: paperStep } : {}),
          ...(showOnline ? { onlineStepIndex: onlineStep } : {}),
          paidAmountVnd: cleanDigits,
          ...(paymentStatus.trim() ? { paymentStatus: paymentStatus.trim() } : {}),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setFeedback('✓ Đã cập nhật tiến độ đơn hàng (khách tra cứu được ngay).')
      await onReload()
    } catch {
      setFeedback('✕ Không thể cập nhật đơn hàng. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="inbox-record-card">
      <div className="inbox-card-top">
        <div>
          <span className="inbox-code-badge">{order.orderCode}</span>
          <strong className="inbox-customer-name">{order.customerName}</strong>
          <span className="inbox-contact-pill">{order.contact}</span>
        </div>
        <span className="inbox-type-badge">
          {order.orderType === 'COMBO'
            ? 'Combo Giấy + Online'
            : order.orderType === 'DIGITAL'
              ? 'Thiệp Online'
              : 'Thiệp Giấy'}
        </span>
      </div>

      <div className="inbox-summary-grid">
        <div>
          <span className="inbox-meta-label">Sản phẩm</span>
          <p>{order.productSummary}</p>
        </div>
        <div>
          <span className="inbox-meta-label">Tổng giá / Đã thanh toán</span>
          <p>
            {formatVndAmount(order.totalAmountVnd)} / <strong>{formatVndAmount(paidAmountVnd)}</strong>
          </p>
        </div>
        <div>
          <span className="inbox-meta-label">Địa chỉ nhận</span>
          <p>{order.shippingAddress}</p>
        </div>
      </div>

      <div className="inbox-controls-grid">
        {showPaper && (
          <label className="inbox-field">
            <span>Tiến độ thiệp giấy (8 bước)</span>
            <select value={paperStep} onChange={(e) => setPaperStep(Number(e.target.value))}>
              {PAPER_TRACK_STEPS.map((st, idx) => (
                <option key={st.key} value={idx}>
                  Bước {idx + 1}: {st.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {showOnline && (
          <label className="inbox-field">
            <span>Tiến độ thiệp online (7 bước)</span>
            <select value={onlineStep} onChange={(e) => setOnlineStep(Number(e.target.value))}>
              {ONLINE_TRACK_STEPS.map((st, idx) => (
                <option key={st.key} value={idx}>
                  Bước {idx + 1}: {st.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="inbox-field">
          <span>Số tiền đã thanh toán (VNĐ)</span>
          <input
            type="text"
            value={paidAmountVnd}
            onChange={(e) => setPaidAmountVnd(e.target.value)}
          />
        </label>

        <label className="inbox-field">
          <span>Trạng thái thanh toán</span>
          <input
            type="text"
            value={paymentStatus}
            placeholder="Ví dụ: Đã thanh toán cọc 50%"
            onChange={(e) => setPaymentStatus(e.target.value)}
          />
        </label>
      </div>

      {feedback && <div className="inbox-feedback-line">{feedback}</div>}

      <div className="inbox-card-actions">
        <button type="button" className="btn-primary" disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Đang lưu...' : 'Cập nhật tiến độ đơn hàng'}
        </button>
      </div>
    </article>
  )
}
