import type { CartItem, CartTotals, SelectedFontInfo } from './cart-types'

export const CART_STORAGE_KEY = 'mori_cart_v1'
export const FONT_STORAGE_KEY = 'mori_selected_font'
export const CART_UPDATED_EVENT = 'mori:cart-updated'
export const OPEN_CART_EVENT = 'mori:open-cart'

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<CartItem>
  return (
    typeof row.id === 'string' &&
    typeof row.slug === 'string' &&
    typeof row.name === 'string' &&
    (row.productType === 'PAPER' || row.productType === 'DIGITAL' || row.productType === 'COMBO') &&
    typeof row.shape === 'string' &&
    typeof row.quantity === 'number' &&
    Number.isFinite(row.quantity) &&
    row.quantity > 0 &&
    typeof row.unitAmountVnd === 'number' &&
    Number.isFinite(row.unitAmountVnd) &&
    row.unitAmountVnd >= 0
  )
}

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidCartItem)
  } catch {
    return []
  }
}

function emitCartUpdated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  emitCartUpdated()
}

export function openCartDrawer(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT))
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  let subtotalVnd = 0
  let discountVnd = 0
  let hasPaper = false
  let standaloneDigitalMaxUnit = 0

  for (const item of items) {
    const qty = Math.max(1, Math.round(item.quantity))
    const unit = Math.max(0, Math.round(item.unitAmountVnd))

    if (item.productType === 'PAPER') {
      hasPaper = true
      subtotalVnd += unit * qty
    } else if (item.productType === 'DIGITAL') {
      subtotalVnd += unit * qty
      if (unit > standaloneDigitalMaxUnit) {
        standaloneDigitalMaxUnit = unit
      }
    } else {
      const digitalUnit = Math.max(0, Math.round(item.linkedDigitalUnitVnd ?? 0))
      const discountedDigital = Math.round(digitalUnit * 0.5)
      subtotalVnd += unit * qty + digitalUnit
      discountVnd += digitalUnit - discountedDigital
    }
  }

  if (hasPaper && standaloneDigitalMaxUnit > 0) {
    const discountedStandalone = Math.round(standaloneDigitalMaxUnit * 0.5)
    discountVnd += standaloneDigitalMaxUnit - discountedStandalone
  }

  const totalVnd = Math.max(0, subtotalVnd - discountVnd)
  return {
    subtotalVnd,
    discountVnd,
    totalVnd,
    hasComboDiscount: discountVnd > 0,
    totalCount: items.length,
  }
}

export function addToCart(input: Omit<CartItem, 'id'> & { id?: string }): CartItem[] {
  const items = getCartItems()
  const existingIndex = items.findIndex(
    (item) =>
      item.slug === input.slug &&
      item.productType === input.productType &&
      item.shape === input.shape &&
      (item.linkedDigitalSlug ?? '') === (input.linkedDigitalSlug ?? '') &&
      (item.fontCode ?? '') === (input.fontCode ?? ''),
  )

  if (existingIndex >= 0) {
    const current = items[existingIndex]
    if (current) {
      const nextQty =
        input.productType === 'DIGITAL'
          ? current.quantity
          : current.quantity + Math.max(1, Math.round(input.quantity))
      const next = [...items]
      next[existingIndex] = { ...current, quantity: nextQty }
      saveCartItems(next)
      return next
    }
  }

  const id =
    input.id ??
    `${input.productType.toLowerCase()}-${input.slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const created: CartItem = {
    ...input,
    id,
    quantity: Math.max(1, Math.round(input.quantity)),
    unitAmountVnd: Math.max(0, Math.round(input.unitAmountVnd)),
  }
  const next = [...items, created]
  saveCartItems(next)
  return next
}

export function updateCartItemQuantity(id: string, quantity: number): CartItem[] {
  const safeQty = Math.max(1, Math.min(10000, Math.round(quantity)))
  const next = getCartItems().map((item) =>
    item.id === id ? { ...item, quantity: safeQty } : item,
  )
  saveCartItems(next)
  return next
}

export function updateCartItemFont(id: string, fontCode: string): CartItem[] {
  const trimmed = fontCode.trim()
  const next = getCartItems().map((item) =>
    item.id === id ? { ...item, fontCode: trimmed || undefined } : item,
  )
  saveCartItems(next)
  return next
}

export function removeCartItem(id: string): CartItem[] {
  const next = getCartItems().filter((item) => item.id !== id)
  saveCartItems(next)
  return next
}

export function clearCart(): void {
  saveCartItems([])
}

export function readSelectedFont(): SelectedFontInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(FONT_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const obj = parsed as Partial<SelectedFontInfo>
    if (typeof obj.code === 'string' && obj.code.trim()) {
      return {
        code: obj.code.trim(),
        name: typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : obj.code.trim(),
      }
    }
    return null
  } catch {
    return null
  }
}
