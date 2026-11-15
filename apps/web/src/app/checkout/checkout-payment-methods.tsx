'use client'

import { formatVnd } from '../../features/cart/cart-types'

export type PaymentMethodCode = 'MOMO' | 'VNPAY' | 'BANK_QR' | 'COD'

interface PaymentMethodsProps {
  value: PaymentMethodCode
  totalVnd: number
  onChange: (next: PaymentMethodCode) => void
}

const METHODS: { id: PaymentMethodCode; title: string; subtitle: string }[] = [
  {
    id: 'MOMO',
    title: 'MoMo — Ví điện tử MoMo',
    subtitle: 'Quét mã QR MoMo Demo để xác nhận thanh toán trực tuyến.',
  },
  {
    id: 'VNPAY',
    title: 'VNPAY — Cổng thanh toán VNPAY-QR / Thẻ nội địa',
    subtitle: 'Quét mã VNPAY-QR Demo bằng ứng dụng ngân hàng hoặc thẻ ATM.',
  },
  {
    id: 'BANK_QR',
    title: 'Chuyển khoản ngân hàng / VietQR',
    subtitle: 'Chuyển khoản nhanh 24/7 qua mã VietQR tới tài khoản xưởng MORI.',
  },
  {
    id: 'COD',
    title: 'Thanh toán khi nhận hàng (COD)',
    subtitle: 'Thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản khi nhận bộ thiệp.',
  },
]

function DemoQrGraphic({ label }: { label: string }) {
  return (
    <div className="payment-qr-box" aria-label={`Mã QR ${label} Demo`}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="22" height="22" rx="3" stroke="#36421d" strokeWidth="4" />
        <rect x="11" y="11" width="8" height="8" fill="#657344" />
        <rect x="46" y="4" width="22" height="22" rx="3" stroke="#36421d" strokeWidth="4" />
        <rect x="53" y="11" width="8" height="8" fill="#657344" />
        <rect x="4" y="46" width="22" height="22" rx="3" stroke="#36421d" strokeWidth="4" />
        <rect x="11" y="53" width="8" height="8" fill="#657344" />
        <rect x="33" y="8" width="6" height="16" fill="#36421d" />
        <rect x="33" y="33" width="12" height="12" fill="#657344" />
        <rect x="50" y="36" width="18" height="6" fill="#36421d" />
        <rect x="34" y="52" width="14" height="16" fill="#36421d" />
        <rect x="54" y="52" width="14" height="14" fill="#657344" />
      </svg>
    </div>
  )
}

export function CheckoutPaymentMethods({ value, totalVnd, onChange }: PaymentMethodsProps) {
  return (
    <section className="checkout-card">
      <h2>2. Phương thức thanh toán (Demo)</h2>
      <div className="payment-method-list">
        {METHODS.map((method) => (
          <label
            key={method.id}
            className={`payment-option-card ${value === method.id ? 'active' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={value === method.id}
              onChange={() => onChange(method.id)}
            />
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#1f241d' }}>
                {method.title}
              </strong>
              <span style={{ fontSize: '12px', color: '#5b6355' }}>{method.subtitle}</span>
            </div>
          </label>
        ))}
      </div>

      {value === 'MOMO' ? (
        <div className="payment-demo-panel">
          <DemoQrGraphic label="MoMo" />
          <div style={{ flex: 1, minWidth: '200px', fontSize: '13px', lineHeight: 1.6 }}>
            <strong>Thẻ hướng dẫn Ví MoMo Demo</strong>
            <p style={{ margin: '4px 0 0', color: '#4d5648' }}>
              Số tiền: <strong>{formatVnd(totalVnd)}</strong> · Chủ ví: <strong>MORI WEDDING STUDIO</strong>.
              Đây là cổng mô phỏng demo (không phát sinh giao dịch thật). Bấm Xác nhận đặt hàng bên dưới để hoàn tất.
            </p>
          </div>
        </div>
      ) : null}

      {value === 'VNPAY' ? (
        <div className="payment-demo-panel">
          <DemoQrGraphic label="VNPAY-QR" />
          <div style={{ flex: 1, minWidth: '200px', fontSize: '13px', lineHeight: 1.6 }}>
            <strong>Cổng VNPAY-QR / Thẻ nội địa Demo</strong>
            <p style={{ margin: '4px 0 0', color: '#4d5648' }}>
              Hỗ trợ quét QR qua hơn 35 ngân hàng (Vietcombank, Techcombank, BIDV, MB...) · Số tiền:{' '}
              <strong>{formatVnd(totalVnd)}</strong>. Chế độ demo không trừ tiền thật.
            </p>
          </div>
        </div>
      ) : null}

      {value === 'BANK_QR' ? (
        <div className="payment-demo-panel">
          <DemoQrGraphic label="VietQR" />
          <div style={{ flex: 1, minWidth: '200px', fontSize: '13px', lineHeight: 1.6 }}>
            <strong>VietQR · Chuyển khoản ngân hàng (Demo)</strong>
            <p style={{ margin: '4px 0 0', color: '#4d5648' }}>
              Ngân hàng TMCP Á Châu (ACB) · STK: <strong>8866 2026 9999</strong> · Chủ TK:{' '}
              <strong>MORI WEDDING STUDIO</strong> · Số tiền: <strong>{formatVnd(totalVnd)}</strong>.
            </p>
          </div>
        </div>
      ) : null}

      {value === 'COD' ? (
        <div className="payment-demo-panel">
          <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#4d5648' }}>
            <strong>Thanh toán khi nhận hàng (COD)</strong>
            <p style={{ margin: '4px 0 0' }}>
              Xưởng MORI sẽ liên hệ xác nhận file in trước khi sản xuất. Bạn thanh toán{' '}
              <strong>{formatVnd(totalVnd)}</strong> khi nhận bộ thiệp tận tay.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
