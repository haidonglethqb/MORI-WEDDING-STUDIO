import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#687063' }}>Không kết nối được đến máy chủ đơn hàng.</div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="order-detail-page">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '16px', color: '#333' }}>Vui lòng đăng nhập để xem chi tiết đơn hàng của bạn.</p>
            <a href="/login" style={{ display: 'inline-block', marginTop: '12px', padding: '10px 24px', background: '#3e4a39', color: '#fff', borderRadius: '999px', textDecoration: 'none' }}>Đăng nhập ngay</a>
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#687063' }}>Đơn hàng này không tồn tại hoặc bạn không có quyền xem.</div>
        </main>
      </>
    )
  }

  const order = (await response.json()) as OrderDetail

  return (
    <>
      <HomeNav />
      <main className="order-detail-page">
        <div style={{ fontSize: '13px', color: '#7a8274', marginBottom: '20px' }}>
          <a href="/" style={{ color: '#55634f', textDecoration: 'none' }}>Trang chủ</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href="/workspace" style={{ color: '#55634f', textDecoration: 'none' }}>Việc của tôi</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#242823' }}>Đơn hàng #{order.orderId.slice(0, 8)}</span>
        </div>

        <header className="order-detail-header">
          <div>
            <h1>Đơn chế tác #{order.orderId.slice(0, 8)}</h1>
            <p style={{ fontSize: '14px', color: '#6a7165', margin: 0 }}>
              Đơn đặt thiệp cưới thủ công tại MORI Atelier
              {order.isFixture ? ' · Mẫu trưng bày thử nghiệm' : ''}
            </p>
          </div>
          <span className={`order-status-badge ${order.status}`}>● {label(order.status)}</span>
        </header>

        <div className="order-detail-grid">
          <div>
            <section className="order-card-section">
              <h2 className="order-card-title">Tiến trình chế tác thủ công</h2>
              <div className="order-info-row">
                <span style={{ color: '#5b6356' }}>Thiệp giấy bã mía mỹ thuật:</span>
                <strong style={{ color: '#252a24' }}>{label(order.physicalStage)}</strong>
              </div>
              <div className="order-info-row">
                <span style={{ color: '#5b6356' }}>Thiệp cưới số tương tác RSVP:</span>
                <strong style={{ color: '#252a24' }}>{label(order.digitalStage)}</strong>
              </div>
              {order.physicalOnHold && (
                <div style={{ marginTop: '12px', padding: '12px 14px', background: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082', fontSize: '13px', color: '#856404' }}>
                  <strong>Lưu ý xưởng:</strong> Đơn đang tạm dừng chế tác. Lý do: {order.holdReason}
                </div>
              )}
            </section>

            <section className="order-card-section">
              <h2 className="order-card-title">Nhật ký vận chuyển &amp; Bàn giao</h2>
              {order.shipmentExceptions.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#7a8174', margin: 0 }}>Chưa có ghi nhận bất thường về vận chuyển.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#b91c1c' }}>
                  {order.shipmentExceptions.map((event) => (
                    <li key={event.createdAt}>{event.reason}</li>
                  ))}
                </ul>
              )}
            </section>

            {order.cancellations.length > 0 && (
              <section className="order-card-section">
                <h2 className="order-card-title">Lịch sử yêu cầu hủy đơn</h2>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#687063' }}>
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
                <span style={{ color: '#5b6356' }}>Phí vận chuyển:</span>
                <span>{formatVnd(order.shippingAmountVnd, 'Miễn phí')}</span>
              </div>
              <div className="order-info-row">
                <span style={{ color: '#5b6356' }}>Thuế VAT &amp; Chứng từ:</span>
                <span>{formatVnd(order.taxAmountVnd, 'Đã bao gồm')}</span>
              </div>
              <div className="order-info-row" style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(85,99,79,0.15)' }}>
                <span style={{ fontWeight: 600, color: '#252a24' }}>Tổng giá trị:</span>
                <span className="order-total-highlight">{formatVnd(order.totalAmountVnd)}</span>
              </div>
            </section>

            <section className="order-card-section">
              <h2 className="order-card-title">Địa chỉ nhận thiệp</h2>
              {order.shipRecipientName ? (
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
                  <strong>{order.shipRecipientName}</strong>
                  <p style={{ margin: '4px 0 0', color: '#687063' }}>{order.shipLocality}, {order.shipProvince}</p>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#7a8174', margin: 0 }}>Giao nhận trực tiếp tại Atelier MORI.</p>
              )}
            </section>

            {order.status !== 'CANCELLED' && !order.cancellations.some((r) => r.state === 'REQUESTED') && (
              <div style={{ marginTop: '16px' }}>
                <CancelOrder orderId={order.orderId} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
