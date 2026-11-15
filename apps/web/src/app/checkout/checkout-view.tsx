'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  CART_UPDATED_EVENT,
  calculateCartTotals,
  clearCart,
  getCartItems,
  readSelectedFont,
} from '../../features/cart/cart-store'
import type { CartItem } from '../../features/cart/cart-types'
import { CheckoutPaymentMethods, type PaymentMethodCode } from './checkout-payment-methods'
import { submitCheckoutOrder } from './checkout-submit'
import { CheckoutSuccess } from './checkout-success'
import { CheckoutSummary } from './checkout-summary'

export function CheckoutView() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCode>('MOMO')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [coupleNames, setCoupleNames] = useState('')
  const [fontCode, setFontCode] = useState('')
  const [fontName, setFontName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [orderResult, setOrderResult] = useState<{ code: string; totalVnd: number } | null>(null)

  useEffect(() => {
    const sync = () => {
      const current = getCartItems()
      setItems(current)
      const itemFont = current.find((i) => i.fontCode)?.fontCode
      const storedFont = readSelectedFont()
      if (itemFont) setFontCode((prev) => prev || itemFont)
      else if (storedFont) {
        setFontCode((prev) => prev || storedFont.code)
        setFontName(storedFont.name)
      }
    }
    sync()
    setLoaded(true)
    window.addEventListener(CART_UPDATED_EVENT, sync)
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync)
  }, [])

  const totals = calculateCartTotals(items)
  const needsShipping = items.some((i) => i.productType !== 'DIGITAL')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (items.length === 0) return
    setErrorMsg('')
    setSubmitting(true)
    try {
      const result = await submitCheckoutOrder({
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        address: shippingAddress,
        city,
        coupleNames,
        fontCode,
        note: notes,
        items,
      })
      if (!result.ok) {
        setErrorMsg(result.errorMessage ?? 'Không thể xác nhận đơn hàng lúc này.')
        return
      }
      const paidTotal = result.totalVnd ?? totals.totalVnd
      clearCart()
      setOrderResult({ code: result.orderCode, totalVnd: paidTotal })
    } catch {
      setErrorMsg('Kết nối tới máy chủ đặt hàng bị gián đoạn. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderResult) {
    return (
      <main className="checkout-page-wrap">
        <CheckoutSuccess
          orderCode={orderResult.code}
          contactPhone={customerPhone}
          contactEmail={customerEmail}
          paymentMethod={paymentMethod}
          totalVnd={orderResult.totalVnd}
        />
      </main>
    )
  }

  return (
    <main className="checkout-page-wrap">
      <header className="checkout-head">
        <span className="checkout-tag">THANH TOÁN DEMO MORI</span>
        <h1>Hoàn tất thông tin đặt thiệp</h1>
        <p>Điền thông tin liên lạc, chọn phương thức thanh toán Demo và nhận mã tra cứu đơn hàng ngay.</p>
      </header>

      {!loaded ? (
        <div className="checkout-card">Đang tải thông tin giỏ hàng...</div>
      ) : items.length === 0 ? (
        <div className="checkout-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: '#5c6556', marginBottom: '20px' }}>Vui lòng chọn mẫu thiệp trước khi tiến hành thanh toán.</p>
          <Link href="/collections" className="checkout-track-btn">Quay lại bộ sưu tập</Link>
        </div>
      ) : (
        <form className="checkout-grid" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            {errorMsg ? <div className="checkout-error">{errorMsg}</div> : null}

            <section className="checkout-card">
              <h2>1. Thông tin liên lạc</h2>
              <div className="checkout-field">
                <label htmlFor="co-name">Họ và tên *</label>
                <input id="co-name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nguyễn Minh Anh" />
              </div>
              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label htmlFor="co-phone">Số điện thoại *</label>
                  <input id="co-phone" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0901 234 567" />
                </div>
                <div className="checkout-field">
                  <label htmlFor="co-email">Email *</label>
                  <input id="co-email" type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="minhanh@example.com" />
                </div>
              </div>
            </section>

            <CheckoutPaymentMethods value={paymentMethod} totalVnd={totals.totalVnd} onChange={setPaymentMethod} />

            <section className="checkout-card">
              <h2>3. Thông tin nhận hàng &amp; nội dung thiệp</h2>
              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label htmlFor="co-address">Địa chỉ nhận thiệp {needsShipping ? '*' : '(tùy chọn)'}</label>
                  <input id="co-address" required={needsShipping} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Số nhà, tên đường, phường/xã" />
                </div>
                <div className="checkout-field">
                  <label htmlFor="co-city">Tỉnh / Thành phố {needsShipping ? '*' : '(tùy chọn)'}</label>
                  <input id="co-city" required={needsShipping} value={city} onChange={(e) => setCity(e.target.value)} placeholder="TP. Hồ Chí Minh / Hà Nội" />
                </div>
              </div>
              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label htmlFor="co-couple">Tên cô dâu &amp; chú rể (tùy chọn)</label>
                  <input id="co-couple" value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} placeholder="Minh Anh & Quốc Bảo" />
                </div>
                <div className="checkout-field">
                  <label htmlFor="co-font">Mã font chữ</label>
                  <input id="co-font" value={fontCode} onChange={(e) => setFontCode(e.target.value)} placeholder="VD: MF-01" />
                  <span className="checkout-font-hint">
                    {fontName ? `Đang chọn: ${fontName} · ` : ''}
                    <Link href="/fonts">Chọn font →</Link>
                  </span>
                </div>
              </div>
              <div className="checkout-field">
                <label htmlFor="co-notes">Ghi chú đặt hàng</label>
                <textarea id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lưu ý về thời gian nhận thiệp, màu giấy hoặc nội dung in..." />
              </div>
            </section>
          </div>

          <CheckoutSummary items={items} totals={totals} submitting={submitting} />
        </form>
      )}
    </main>
  )
}
