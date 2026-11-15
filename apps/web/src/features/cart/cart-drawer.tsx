'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  calculateCartTotals,
  removeCartItem,
  updateCartItemQuantity,
} from './cart-store'
import { formatShapeLabel, formatVnd, type CartItem } from './cart-types'
import './cart-drawer.css'

interface CartDrawerProps {
  isOpen: boolean
  items: CartItem[]
  onClose: () => void
}

function getStepForItem(item: CartItem): number {
  if (item.productType === 'DIGITAL') return 1
  return item.quantity >= 50 ? 50 : 10
}

function getItemLineTotal(item: CartItem): number {
  const base = item.unitAmountVnd * item.quantity
  if (item.productType === 'COMBO') {
    return base + Math.round((item.linkedDigitalUnitVnd ?? 0) * 0.5)
  }
  return base
}

export function CartDrawer({ isOpen, items, onClose }: CartDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const totals = calculateCartTotals(items)

  return createPortal(
    <div
      className="cart-drawer-backdrop"
      data-mori-cart-drawer="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Giỏ hàng MORI"
    >
      <aside className="cart-drawer-panel">
        <div className="cart-drawer-head">
          <h2>Giỏ hàng ({totals.totalCount})</h2>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Đóng giỏ hàng"
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <p>Giỏ hàng của bạn đang trống. Khám phá bộ sưu tập thiệp giấy &amp; thiệp online tại MORI.</p>
              <Link href="/collections" className="cart-btn-primary" onClick={onClose}>
                Xem bộ sưu tập
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const step = getStepForItem(item)
              return (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-item-thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span>{item.productType === 'DIGITAL' ? 'Online' : 'MORI'}</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <p className="cart-item-name">{item.name}</p>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeCartItem(item.id)}
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="cart-item-meta">
                      <span className="cart-type-badge">
                        {item.productType === 'COMBO'
                          ? 'Combo'
                          : item.productType === 'DIGITAL'
                            ? 'Thiệp online'
                            : 'Thiệp giấy'}
                      </span>
                      <span>{formatShapeLabel(item.shape)}</span>
                      {item.fontCode ? <span>· Font {item.fontCode}</span> : null}
                    </div>
                    {item.productType === 'COMBO' && item.linkedDigitalName ? (
                      <div className="cart-item-combo-note">
                        Kèm {item.linkedDigitalName} (-50%)
                      </div>
                    ) : null}
                    <div className="cart-item-bottom">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${item.name}`}
                          onClick={() =>
                            updateCartItemQuantity(item.id, Math.max(1, item.quantity - step))
                          }
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Tăng số lượng ${item.name}`}
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + step)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-price">{formatVnd(getItemLineTotal(item))}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 ? (
          <div className="cart-drawer-foot">
            <div className="cart-summary-row">
              <span>Tạm tính</span>
              <span>{formatVnd(totals.subtotalVnd)}</span>
            </div>
            {totals.hasComboDiscount ? (
              <div className="cart-summary-row cart-summary-discount">
                <span>Ưu đãi Combo -50% thiệp online</span>
                <span>-{formatVnd(totals.discountVnd)}</span>
              </div>
            ) : null}
            <div className="cart-summary-total">
              <span>Tổng phụ</span>
              <span>{formatVnd(totals.totalVnd)}</span>
            </div>
            <div className="cart-drawer-actions">
              <Link href="/cart" className="cart-btn-outline" onClick={onClose}>
                ĐI TỚI GIỎ HÀNG
              </Link>
              <Link href="/checkout" className="cart-btn-primary" onClick={onClose}>
                THANH TOÁN
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  )
}
