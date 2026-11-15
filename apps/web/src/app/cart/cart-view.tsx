'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  CART_UPDATED_EVENT,
  calculateCartTotals,
  getCartItems,
  readSelectedFont,
} from '../../features/cart/cart-store'
import { formatVnd, type CartItem } from '../../features/cart/cart-types'
import { CartItemRow } from './cart-item-row'

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([])
  const [savedFontCode, setSavedFontCode] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const sync = () => setItems(getCartItems())
    sync()
    setSavedFontCode(readSelectedFont()?.code ?? '')
    setLoaded(true)
    window.addEventListener(CART_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const totals = calculateCartTotals(items)
  const hasPaper = items.some((i) => i.productType === 'PAPER')

  return (
    <main className="cart-page-wrap">
      <header className="cart-page-head">
        <span className="cart-page-tag">GIỎ HÀNG MORI</span>
        <h1>Kiểm tra đơn thiệp của bạn</h1>
        <p>
          Xem lại số lượng, quy cách, mã font chữ và ưu đãi giảm 50% thiệp online khi đi kèm thiệp giấy.
        </p>
      </header>

      {!loaded ? (
        <div className="cart-empty-panel">Đang tải giỏ hàng...</div>
      ) : items.length === 0 ? (
        <div className="cart-empty-panel">
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: '#5c6556', marginBottom: '20px' }}>
            Hãy chọn mẫu thiệp cưới vật lý, thiệp online hoặc combo tiết kiệm tại bộ sưu tập MORI.
          </p>
          <Link href="/collections" className="cart-action-primary" style={{ padding: '0 24px' }}>
            Khám phá bộ sưu tập
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-list-card">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                hasPaperInCart={hasPaper}
                fallbackFontCode={savedFontCode}
              />
            ))}
          </div>

          <aside className="cart-summary-panel">
            <h2 style={{ margin: '0 0 12px', fontSize: '20px' }}>Tóm tắt giỏ hàng</h2>
            <div className="cart-sum-row">
              <span>Số dòng sản phẩm</span>
              <strong>{totals.totalCount} món</strong>
            </div>
            <div className="cart-sum-row">
              <span>Tạm tính</span>
              <span>{formatVnd(totals.subtotalVnd)}</span>
            </div>
            {totals.hasComboDiscount ? (
              <div className="cart-sum-row cart-sum-discount">
                <span>Ưu đãi Combo -50% thiệp online</span>
                <span>-{formatVnd(totals.discountVnd)}</span>
              </div>
            ) : null}
            <div className="cart-sum-total">
              <span>Tổng thanh toán</span>
              <strong>{formatVnd(totals.totalVnd)}</strong>
            </div>
            <div className="cart-page-actions">
              <Link href="/checkout" className="cart-action-primary">
                Tiến hành thanh toán
              </Link>
              <Link href="/collections" className="cart-action-secondary">
                Tiếp tục chọn mẫu
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
