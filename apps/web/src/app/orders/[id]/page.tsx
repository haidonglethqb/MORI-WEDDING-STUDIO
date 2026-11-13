import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
import { AtelierCrumbs } from '../../../components/atelier-crumbs'
import { CancelOrder } from './cancel-order'
import { statusLabel, formatVnd } from './order-labels'
import './order-detail.css'

export const dynamic = 'force-dynamic'

interface OrderDetail {
  orderId: string
  status: string
  currency: 'VND'
  totalAmountVnd: string
  shippingAmountVnd: string | null
  taxAmountVnd: string | null
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
  physicalOnHold: boolean
  holdReason: string | null
  shipRecipientName: string | null
  shipLocality: string | null
  shipProvince: string | null
  shipmentExceptions: { reason: string; createdAt: string }[]
  cancellations: { state: string; reason: string }[]
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

function label(value: string | null): string {
  if (!value) return 'Không có'
  return statusLabel[value] ?? value
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response

  try {
    response = await fetch(`${apiOrigin()}/api/v1/orders/${id}`, { headers: { cookie }, cache: 'no-store' })
  } catch {
    return (
      <>
        <HomeNav />
        <main className="order-detail-page">
          <div className="atelier-empty">Không kết nối được đến máy chủ đơn hàng.</div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="order-detail-page">
          <div className="atelier-empty">
            <p>Vui lòng đăng nhập để xem chi tiết đơn hàng của bạn.</p>
            <a href="/login" className="workspace-btn-primary">Đăng nhập ngay</a>
          </div>
        </main>
      </>
    )
  }

  if (!response.ok) {
    return (
      <>
        <HomeNav />
        <main className="order-detail-page">
          <div className="atelier-empty">Đơn hàng này không tồn tại hoặc bạn không có quyền xem.</div>
        </main>
      </>
    )
  }

  const order = (await response.json()) as OrderDetail

  return (
    <>
      <HomeNav />
      <main className="order-detail-page">
        <AtelierCrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Việc của tôi', href: '/workspace' }, { label: `Đơn hàng #${order.orderId.slice(0, 8)}` }]} />

        <header className="order-detail-header">
          <div>
            <span className="atelier-eyebrow">Đơn chế tác · #{order.orderId.slice(0, 8)}</span>
            <h1>Tiến trình đơn thiệp của bạn</h1>
            <p>
              Đơn đặt thiệp cưới thủ công tại MORI Atelier
              {order.isFixture ? ' · Mẫu trưng bày thử nghiệm' : ''}
            </p>
          </div>
          <span className={`atelier-state ${order.status}`}>{label(order.status)}</span>
        </header>

        <div className="order-detail-grid">
          <div>
            <section className="order-card-section">
              <h2 className="order-card-title">Tiến trình chế tác thủ công</h2>
              <div className="order-info-row">
                <span>Thiệp giấy mỹ thuật</span>
                <strong>{label(order.physicalStage)}</strong>
              </div>
              <div className="order-info-row">
                <span>Thiệp cưới số & RSVP</span>
                <strong>{label(order.digitalStage)}</strong>
              </div>
              {order.physicalOnHold && (
                <div className="atelier-alert" role="status">
                  <strong>Lưu ý xưởng:</strong> Đơn đang tạm dừng chế tác. Lý do: {order.holdReason}
                </div>
              )}
            </section>

            <section className="order-card-section">
              <h2 className="order-card-title">Nhật ký vận chuyển &amp; Bàn giao</h2>
              {order.shipmentExceptions.length === 0 ? (
                <p className="atelier-empty atelier-empty--inline">Chưa có ghi nhận bất thường về vận chuyển.</p>
              ) : (
                <ul className="atelier-list is-danger">
                  {order.shipmentExceptions.map((event) => (
                    <li key={event.createdAt}>{event.reason}</li>
                  ))}
                </ul>
              )}
            </section>

            {order.cancellations.length > 0 && (
              <section className="order-card-section">
                <h2 className="order-card-title">Lịch sử yêu cầu hủy đơn</h2>
                <ul className="atelier-list">
                  {order.cancellations.map((row) => (
                    <li key={row.reason}><strong>{label(row.state)}:</strong> {row.reason}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div>
            <section className="order-card-section">
              <h2 className="order-card-title">Dự toán hoàn thiện</h2>
              <div className="order-info-row">
                <span>Phí vận chuyển</span>
                <span>{formatVnd(order.shippingAmountVnd, 'Miễn phí')}</span>
              </div>
              <div className="order-info-row">
                <span>Thuế VAT &amp; chứng từ</span>
                <span>{formatVnd(order.taxAmountVnd, 'Đã bao gồm')}</span>
              </div>
              <div className="order-info-row is-total">
                <span>Tổng giá trị</span>
                <span className="order-total-highlight">{formatVnd(order.totalAmountVnd)}</span>
              </div>
            </section>

            <section className="order-card-section">
              <h2 className="order-card-title">Địa chỉ nhận thiệp</h2>
              {order.shipRecipientName ? (
                <div className="atelier-address">
                  <strong>{order.shipRecipientName}</strong>
                  <p>{order.shipLocality}, {order.shipProvince}</p>
                </div>
              ) : (
                <p className="atelier-empty atelier-empty--inline">Giao nhận trực tiếp tại Atelier MORI.</p>
              )}
            </section>

            {order.status !== 'CANCELLED' && !order.cancellations.some((r) => r.state === 'REQUESTED') && (
              <div className="atelier-cancel">
                <CancelOrder orderId={order.orderId} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
