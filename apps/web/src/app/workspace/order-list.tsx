export interface OrderListItem {
  orderId: string
  status: string
  currency: 'VND'
  totalAmountVnd: string
}

export interface CustomerRequestItem {
  requestId: string
  kind: string
  status: string
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Xưởng đã nhận',
  IN_FULFILLMENT: 'Đang chế tác',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

const kindLabel: Record<string, string> = {
  PAPER: 'Thiệp giấy mỹ thuật',
  DIGITAL: 'Thiệp cưới số',
  BUNDLE: 'Gói trọn bộ',
}

export function OrderList({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) return <div className="workspace-empty">Chưa có đơn in nào.</div>
  return (
    <ul className="workspace-list">
      {orders.map((order) => (
        <li key={order.orderId} className="workspace-item">
          <div className="workspace-item-info">
            <span className="workspace-item-title">#{order.orderId.slice(0, 8)}</span>
            <span className="workspace-item-meta">
              {Number(order.totalAmountVnd).toLocaleString('vi-VN')} {order.currency}
            </span>
          </div>
          <div className="workspace-item-actions">
            <span className={`badge-tag ${order.status}`}>{statusLabel[order.status] ?? order.status}</span>
            <a href={`/orders/${order.orderId}`} className="workspace-action-link">
              Xem
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function RequestList({ requests }: { requests: CustomerRequestItem[] }) {
  if (requests.length === 0) return <div className="workspace-empty">Chưa có yêu cầu thiết kế riêng nào.</div>
  return (
    <ul className="workspace-list">
      {requests.map((req) => (
        <li key={req.requestId} className="workspace-item">
          <div className="workspace-item-info">
            <span className="workspace-item-title">{kindLabel[req.kind] ?? req.kind}</span>
            <span className="workspace-item-meta">Mã: #{req.requestId.slice(0, 8)}</span>
          </div>
          <div className="workspace-item-actions">
            <span className={`badge-tag ${req.status}`}>{statusLabel[req.status] ?? req.status}</span>
            <a href={`/requests/${req.requestId}`} className="workspace-action-link">
              Chi tiết
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
