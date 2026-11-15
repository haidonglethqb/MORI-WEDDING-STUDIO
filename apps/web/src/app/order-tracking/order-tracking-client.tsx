'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ONLINE_TRACK_STEPS,
  PAPER_TRACK_STEPS,
  formatVndAmount,
  normalizeTrackedOrder,
  type TrackedOrder,
} from './order-tracking-types'
import { OrderProgressTrack } from './order-progress-track'

const DEMO_CODES = ['MORI-0001', 'MORI-0002', 'MORI-0003']

export function OrderTrackingClient({
  initialCode,
  initialContact,
}: {
  initialCode: string
  initialContact: string
}) {
  const [code, setCode] = useState(initialCode)
  const [contact, setContact] = useState(initialContact)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  async function lookupOrder(targetCode: string, targetContact: string) {
    const cleanCode = targetCode.trim()
    const cleanContact = targetContact.trim()
    if (!cleanCode || !cleanContact) {
      setOrder(null)
      setErrorMsg('Bạn vui lòng nhập đầy đủ mã đơn hàng và thông tin liên hệ nhé!')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    try {
      const url = `/api/storefront/orders/track?code=${encodeURIComponent(cleanCode)}&contact=${encodeURIComponent(cleanContact)}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        setOrder(null)
        setErrorMsg(
          'MORI chưa tìm thấy đơn hàng phù hợp. Bạn kiểm tra lại thông tin hoặc liên hệ nhân viên để được hỗ trợ nha.',
        )
        return
      }
      const rawPayload = (await res.json()) as Record<string, unknown>
      const orderRecord =
        rawPayload['order'] && typeof rawPayload['order'] === 'object'
          ? (rawPayload['order'] as Record<string, unknown>)
          : rawPayload
      if (!orderRecord || (!orderRecord['orderCode'] && !orderRecord['code'])) {
        setOrder(null)
        setErrorMsg(
          'MORI chưa tìm thấy đơn hàng phù hợp. Bạn kiểm tra lại thông tin hoặc liên hệ nhân viên để được hỗ trợ nha.',
        )
        return
      }
      setOrder(normalizeTrackedOrder(orderRecord))
    } catch {
      setOrder(null)
      setErrorMsg(
        'MORI chưa tìm thấy đơn hàng phù hợp. Bạn kiểm tra lại thông tin hoặc liên hệ nhân viên để được hỗ trợ nha.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCode.trim() && initialContact.trim()) {
      void lookupOrder(initialCode, initialContact)
    }
  }, [initialCode, initialContact])

  return (
    <div className="tracking-workspace">
      <form
        className="tracking-search-card"
        onSubmit={(e) => {
          e.preventDefault()
          void lookupOrder(code, contact)
        }}
      >
        <div className="tracking-inputs-grid">
          <label className="tracking-field">
            <span>Mã đơn hàng</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: MORI-0001"
              autoComplete="off"
            />
          </label>
          <label className="tracking-field">
            <span>Số điện thoại hoặc Email đã đặt hàng</span>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Ví dụ: 0901234567 hoặc khachhang@mori.vn"
              autoComplete="off"
            />
          </label>
        </div>

        <button type="submit" className="tracking-submit-btn" disabled={loading}>
          {loading ? 'Đang tra cứu...' : 'KIỂM TRA ĐƠN HÀNG'}
        </button>

        <div className="tracking-demo-row">
          <span>Thử nhanh mã mẫu (SĐT 0901234567):</span>
          {DEMO_CODES.map((demo) => (
            <button
              key={demo}
              type="button"
              className="tracking-demo-pill"
              onClick={() => {
                setCode(demo)
                setContact('0901234567')
                void lookupOrder(demo, '0901234567')
              }}
            >
              {demo}
            </button>
          ))}
        </div>

        {errorMsg ? (
          <div className="tracking-alert-error" role="alert">
            {errorMsg}
          </div>
        ) : null}
      </form>

      {order ? (
        <section className="tracking-result-card" aria-live="polite">
          <div className="tracking-result-head">
            <div>
              <span className="tracking-code-kicker">THÔNG TIN ĐƠN HÀNG</span>
              <h2>Mã đơn: {order.orderCode}</h2>
            </div>
            <span className={`tracking-status-pill ${order.isCancelled ? 'is-cancelled' : ''}`}>
              {order.currentStatusLabel}
            </span>
          </div>

          <dl className="tracking-details-grid">
            <div><dt>Ngày đặt hàng</dt><dd>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</dd></div>
            <div><dt>Tên sản phẩm &amp; kiểu thiệp</dt><dd>{order.productSummary} · {order.cardTypeLabel}</dd></div>
            <div><dt>Số lượng đặt</dt><dd>{order.quantity} bộ</dd></div>
            <div><dt>Tổng giá trị đơn hàng</dt><dd className="tracking-money-strong">{formatVndAmount(order.totalVnd)}</dd></div>
            <div><dt>Số tiền đã thanh toán</dt><dd>{formatVndAmount(order.paidVnd)}</dd></div>
            <div><dt>Số tiền còn lại</dt><dd>{formatVndAmount(order.remainingVnd)}</dd></div>
            <div className="is-wide"><dt>Địa chỉ nhận thiệp giấy</dt><dd>{order.shippingAddress}</dd></div>
            <div><dt>Trạng thái hiện tại</dt><dd>{order.currentStatusLabel}</dd></div>
            {order.onlineLink ? (
              <div><dt>Đường link thiệp online</dt><dd><a href={order.onlineLink} className="tracking-inline-link">{order.onlineLink}</a></dd></div>
            ) : null}
          </dl>

          <div className="tracking-tracks-wrap">
            {order.hasPaper ? (
              <OrderProgressTrack
                title="Tiến trình thiệp giấy (8 bước)"
                steps={PAPER_TRACK_STEPS}
                currentStepIndex={order.paperStepIndex}
                isCancelled={order.isCancelled}
              />
            ) : null}
            {order.hasOnline ? (
              <OrderProgressTrack
                title="Tiến trình thiệp online (7 bước)"
                steps={ONLINE_TRACK_STEPS}
                currentStepIndex={order.onlineStepIndex}
                isCancelled={order.isCancelled}
              />
            ) : null}
          </div>

          <div className="tracking-result-footer">
            <p>Cần điều chỉnh thông tin giao nhận, duyệt bản thiết kế hoặc gửi biên lai?</p>
            <Link href="/assistant" className="guide-btn-primary">
              Liên hệ hỗ trợ
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  )
}
