'use client'

import Link from 'next/link'
import {
  removeCartItem,
  updateCartItemFont,
  updateCartItemQuantity,
} from '../../features/cart/cart-store'
import { formatShapeLabel, formatVnd, type CartItem } from '../../features/cart/cart-types'

interface CartItemRowProps {
  item: CartItem
  hasPaperInCart: boolean
  fallbackFontCode: string
}

function itemBasePrice(item: CartItem): number {
  const paperPart = item.unitAmountVnd * item.quantity
  if (item.productType === 'COMBO') {
    return paperPart + Math.round((item.linkedDigitalUnitVnd ?? 0) * 0.5)
  }
  return paperPart
}

export function CartItemRow({ item, hasPaperInCart, fallbackFontCode }: CartItemRowProps) {
  const step = item.productType === 'DIGITAL' ? 1 : item.quantity >= 50 ? 50 : 10

  return (
    <article className="cart-row-card">
      <div className="cart-row-thumb">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <span>{item.productType === 'DIGITAL' ? 'Thiệp Online' : 'MORI'}</span>
        )}
      </div>
      <div>
        <div className="cart-row-top">
          <Link href={`/products/${item.slug}`} className="cart-row-title">
            {item.name}
          </Link>
          <button
            type="button"
            className="cart-row-remove"
            onClick={() => removeCartItem(item.id)}
          >
            Xóa
          </button>
        </div>

        <div className="cart-row-badges">
          <span className="cart-badge-sage">
            {item.productType === 'COMBO'
              ? 'Combo Tiết kiệm -50%'
              : item.productType === 'DIGITAL'
                ? 'Thiệp online'
                : 'Thiệp giấy'}
          </span>
          <span className="cart-badge-ivory">{formatShapeLabel(item.shape)}</span>
          <span className="cart-badge-ivory">Đơn giá: {formatVnd(item.unitAmountVnd)}</span>
        </div>

        {item.productType === 'COMBO' && item.linkedDigitalName ? (
          <div style={{ fontSize: '13px', color: '#425024', marginBottom: '6px' }}>
            Kèm website thiệp online: <strong>{item.linkedDigitalName}</strong>{' '}
            <span style={{ textDecoration: 'line-through', color: '#838b7d' }}>
              {formatVnd(item.linkedDigitalUnitVnd ?? 0)}
            </span>{' '}
            → <strong>{formatVnd(Math.round((item.linkedDigitalUnitVnd ?? 0) * 0.5))} (-50%)</strong>
          </div>
        ) : null}

        {item.productType === 'DIGITAL' && hasPaperInCart ? (
          <div style={{ fontSize: '12px', color: '#425024', marginBottom: '6px' }}>
            Đủ điều kiện ưu đãi Combo -50% khi đặt cùng thiệp giấy trong giỏ.
          </div>
        ) : null}

        <div className="cart-font-inline">
          <label htmlFor={`font-${item.id}`}>Mã font:</label>
          <input
            id={`font-${item.id}`}
            type="text"
            value={item.fontCode ?? fallbackFontCode}
            placeholder="VD: MF-01"
            onChange={(e) => updateCartItemFont(item.id, e.target.value)}
          />
          <Link href="/fonts">Chọn tại trang Font →</Link>
        </div>

        <div className="cart-row-controls">
          <div className="cart-qty-editor">
            <button
              type="button"
              aria-label={`Giảm số lượng ${item.name}`}
              onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - step))}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="10000"
              aria-label={`Số lượng ${item.name}`}
              value={item.quantity}
              onChange={(e) => updateCartItemQuantity(item.id, Number(e.target.value) || 1)}
            />
            <button
              type="button"
              aria-label={`Tăng số lượng ${item.name}`}
              onClick={() => updateCartItemQuantity(item.id, item.quantity + step)}
            >
              +
            </button>
          </div>
          <strong style={{ fontSize: '17px', color: '#3f4c23' }}>
            {formatVnd(itemBasePrice(item))}
          </strong>
        </div>
      </div>
    </article>
  )
}
