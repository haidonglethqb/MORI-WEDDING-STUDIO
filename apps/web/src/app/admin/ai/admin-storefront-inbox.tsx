'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  extractArrayPayload,
  normalizeOrderRow,
  normalizeRequestRow,
} from './admin-storefront-mappers'
import { AdminStorefrontOrders } from './admin-storefront-orders'
import { AdminStorefrontRequests } from './admin-storefront-requests'
import type { CustomRequestRecord, StorefrontOrderRecord } from './admin-ai-types'

export function AdminStorefrontInbox() {
  const [subTab, setSubTab] = useState<'orders' | 'requests'>('orders')
  const [orders, setOrders] = useState<StorefrontOrderRecord[]>([])
  const [requests, setRequests] = useState<CustomRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [apiNotice, setApiNotice] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setApiNotice(null)
    try {
      const [ordersRes, reqsRes] = await Promise.all([
        fetch('/admin/ai/storefront-orders', { cache: 'no-store' }),
        fetch('/admin/ai/custom-requests', { cache: 'no-store' }),
      ])

      if (ordersRes.ok) {
        const rawOrders = (await ordersRes.json()) as unknown
        setOrders(extractArrayPayload(rawOrders, 'orders').map(normalizeOrderRow))
      }
      if (reqsRes.ok) {
        const rawReqs = (await reqsRes.json()) as unknown
        setRequests(
          extractArrayPayload(rawReqs, 'requests', 'customRequests').map(normalizeRequestRow),
        )
      }
      if (!ordersRes.ok && !reqsRes.ok) {
        setApiNotice('Máy chủ API đơn hàng storefront chưa phản hồi hoặc yêu cầu quyền Admin/Studio.')
      }
    } catch {
      setApiNotice('Không thể kết nối tới danh sách đơn hàng và yêu cầu thiết kế riêng.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  return (
    <div className="admin-inbox-wrap">
      <div className="inbox-toolbar">
        <div className="inbox-subtabs">
          <button
            type="button"
            className={`inbox-subtab-btn ${subTab === 'orders' ? 'is-active' : ''}`}
            onClick={() => setSubTab('orders')}
          >
            Đơn đặt hàng thiệp ({orders.length})
          </button>
          <button
            type="button"
            className={`inbox-subtab-btn ${subTab === 'requests' ? 'is-active' : ''}`}
            onClick={() => setSubTab('requests')}
          >
            Yêu cầu thiết kế riêng ({requests.length})
          </button>
        </div>

        <button type="button" className="btn-secondary-sm" onClick={() => void loadAll()}>
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {apiNotice && <div className="logs-empty">{apiNotice}</div>}

      {subTab === 'orders' ? (
        <AdminStorefrontOrders orders={orders} onReload={loadAll} />
      ) : (
        <AdminStorefrontRequests requests={requests} onReload={loadAll} />
      )}
    </div>
  )
}
