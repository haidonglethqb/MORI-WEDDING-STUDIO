import { formatShapeLabel, formatVnd, type CartItem, type CartTotals } from '../../features/cart/cart-types'

interface CheckoutSummaryProps {
  items: CartItem[]
  totals: CartTotals
  submitting: boolean
}

export function CheckoutSummary({ items, totals, submitting }: CheckoutSummaryProps) {
  return (
    <aside className="checkout-summary-card">
      <h2 style={{ margin: '0 0 14px', fontSize: '20px' }}>
        Đơn hàng của bạn ({totals.totalCount})
      </h2>
      {items.map((item) => (
        <div key={item.id} className="checkout-summary-item">
          <div>
            <strong>{item.name}</strong>
            <div style={{ color: '#5c6556', fontSize: '12px' }}>
              {item.productType === 'COMBO'
                ? 'Combo -50%'
                : item.productType === 'DIGITAL'
                  ? 'Thiệp online'
                  : 'Thiệp giấy'}{' '}
              · {formatShapeLabel(item.shape)} × {item.quantity}
            </div>
            {item.productType === 'COMBO' && item.linkedDigitalName ? (
              <div style={{ color: '#465429', fontSize: '11px' }}>
                + {item.linkedDigitalName} (-50%)
              </div>
            ) : null}
          </div>
          <strong>
            {formatVnd(
              item.unitAmountVnd * item.quantity +
                (item.productType === 'COMBO'
                  ? Math.round((item.linkedDigitalUnitVnd ?? 0) * 0.5)
                  : 0),
            )}
          </strong>
        </div>
      ))}
      <div className="checkout-sum-row" style={{ marginTop: '10px' }}>
        <span>Tạm tính</span>
        <span>{formatVnd(totals.subtotalVnd)}</span>
      </div>
      {totals.hasComboDiscount ? (
        <div className="checkout-sum-row checkout-sum-discount">
          <span>Ưu đãi Combo -50% thiệp online</span>
          <span>-{formatVnd(totals.discountVnd)}</span>
        </div>
      ) : null}
      <div className="checkout-sum-total">
        <span>Tổng cộng</span>
        <strong>{formatVnd(totals.totalVnd)}</strong>
      </div>
      <button type="submit" className="checkout-submit-btn" disabled={submitting}>
        {submitting ? 'Đang xử lý đơn hàng...' : 'Thanh toán ngay / Xác nhận đặt hàng'}
      </button>
    </aside>
  )
}
