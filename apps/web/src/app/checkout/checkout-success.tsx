import Link from 'next/link'
import { formatVnd } from '../../features/cart/cart-types'
import type { PaymentMethodCode } from './checkout-payment-methods'

interface CheckoutSuccessProps {
  orderCode: string
  contactPhone: string
  contactEmail: string
  paymentMethod: PaymentMethodCode
  totalVnd: number
}

const METHOD_LABELS: Record<PaymentMethodCode, string> = {
  MOMO: 'Ví MoMo (Demo)',
  VNPAY: 'VNPAY-QR (Demo)',
  BANK_QR: 'Chuyển khoản VietQR (Demo)',
  COD: 'Thanh toán khi nhận hàng (COD)',
}

export function CheckoutSuccess({
  orderCode,
  contactPhone,
  contactEmail,
  paymentMethod,
  totalVnd,
}: CheckoutSuccessProps) {
  const lookupContact = contactPhone || contactEmail
  const trackingHref = `/order-tracking?code=${encodeURIComponent(orderCode)}&contact=${encodeURIComponent(lookupContact)}`

  return (
    <section className="checkout-success-card" role="status">
      <span className="checkout-tag">ĐẶT HÀNG THÀNH CÔNG</span>
      <h1 style={{ fontFamily: 'Lora, serif', margin: '8px 0', fontSize: '30px' }}>
        Cảm ơn bạn đã đặt thiệp tại MORI
      </h1>
      <p style={{ color: '#555e50', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
        Đơn hàng của bạn đã được ghi nhận và chuyển tới đội ngũ Xưởng MORI. Hãy lưu lại mã đơn hàng để tra cứu tiến độ bất kỳ lúc nào.
      </p>

      <div className="checkout-order-code">{orderCode}</div>

      <div
        style={{
          textAlign: 'left',
          background: '#f5f7ef',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '13px',
          lineHeight: 1.7,
          marginTop: '12px',
        }}
      >
        <div>
          <strong>SĐT / Email tra cứu:</strong> {contactPhone}
          {contactEmail ? ` · ${contactEmail}` : ''}
        </div>
        <div>
          <strong>Phương thức thanh toán:</strong> {METHOD_LABELS[paymentMethod]}
        </div>
        <div>
          <strong>Tổng giá trị đơn hàng:</strong> {formatVnd(totalVnd)}
        </div>
      </div>

      <div className="checkout-success-actions">
        <Link href={trackingHref} className="checkout-track-btn">
          Kiểm tra tiến độ đơn hàng
        </Link>
        <Link href="/collections" className="checkout-back-btn">
          Về bộ sưu tập
        </Link>
      </div>
    </section>
  )
}
