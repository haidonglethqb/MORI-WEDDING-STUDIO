'use client'

import type { StorefrontOrderRecord } from './admin-ai-types'
import { AdminStorefrontOrderCard } from './admin-storefront-order-card'

interface OrdersProps {
  orders: StorefrontOrderRecord[]
  onReload: () => Promise<void>
}

export function AdminStorefrontOrders({ orders, onReload }: OrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="logs-empty">
        Chưa có đơn hàng storefront nào. Khi khách đặt thiệp qua giỏ hàng, đơn sẽ hiển thị tại đây.
      </div>
    )
  }

  return (
    <div className="inbox-cards-stack">
      {orders.map((order) => (
        <AdminStorefrontOrderCard key={order.orderCode} order={order} onReload={onReload} />
      ))}
    </div>
  )
}
