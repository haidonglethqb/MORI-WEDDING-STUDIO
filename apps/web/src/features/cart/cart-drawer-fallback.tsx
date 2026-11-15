'use client'

import { useEffect, useState } from 'react'
import { CartDrawer } from './cart-drawer'
import {
  CART_UPDATED_EVENT,
  OPEN_CART_EVENT,
  calculateCartTotals,
  getCartItems,
} from './cart-store'
import type { CartItem } from './cart-types'
import './cart-nav-button.css'

export function CartDrawerFallback() {
  const [hasHeaderNav, setHasHeaderNav] = useState(true)
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const navMounted = Boolean(document.querySelector('[data-mori-cart-nav="true"]'))
    setHasHeaderNav(navMounted)
    if (navMounted) return

    const sync = () => setItems(getCartItems())
    const handleOpen = () => {
      sync()
      setIsOpen(true)
    }
    sync()
    window.addEventListener(CART_UPDATED_EVENT, sync)
    window.addEventListener(OPEN_CART_EVENT, handleOpen)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync)
      window.removeEventListener(OPEN_CART_EVENT, handleOpen)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (hasHeaderNav) return null

  const { totalCount } = calculateCartTotals(items)

  return (
    <>
      <button
        type="button"
        className="cart-nav-btn cart-fallback-float"
        onClick={() => setIsOpen(true)}
        aria-label={`Mở giỏ hàng (${totalCount} sản phẩm)`}
      >
        <svg
          className="cart-nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6 5 3H2" />
          <circle cx="9.5" cy="19.5" r="1.2" />
          <circle cx="18.5" cy="19.5" r="1.2" />
        </svg>
        <span>Giỏ hàng</span>
        <span className="cart-nav-badge">{totalCount}</span>
      </button>
      <CartDrawer isOpen={isOpen} items={items} onClose={() => setIsOpen(false)} />
    </>
  )
}
