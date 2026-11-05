import { cookies } from 'next/headers'
import { HomeNav } from '../../../home-nav'
import { AdvanceOrder } from './advance-order'
import { DecideCancellation } from './decide-cancellation'
import { OrderException } from './order-exception'
import '../../studio.css'
import '../../../workspace/workspace.css'

export const dynamic = 'force-dynamic'

interface StudioOrderItem {
  orderId: string
  status: string
  isFixture: boolean
  physicalStage: string | null
  digitalStage: string | null
  cancellations: { cancellationId: string; state: string; reason: string }[]
}

const stageLabel: Record<string, string> = {
  SUBMITTED: 'Đã gửi yêu cầu',
  CONFIRMED: 'Đã xác nhận',
  IN_FULFILLMENT: 'Đang thực hiện',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  PENDING: 'Chờ xử lý',
  IN_PRODUCTION: 'Đang in ấn & gia công',
  QUALITY_CHECK: 'Đang kiểm tra chất lượng',
  READY_TO_SHIP: 'Sẵn sàng giao hàng',
  SHIPPED: 'Đã chuyển đi',
  DELIVERED: 'Đã giao tới nơi',
  IN_PROGRESS: 'Đang dựng bản số',
  READY_FOR_HANDOVER: 'Sẵn sàng bàn giao',
  HANDED_OVER: 'Đã bàn giao hoàn tất',
  REQUESTED: 'Đang chờ xưởng duyệt',
  APPROVED: 'Đã duyệt hủy',
  DENIED: 'Xưởng giữ đơn',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

function label(value: string | null): string {
  if (!value) return 'Không áp dụng'
  return stageLabel[value] ?? value
}

export default async function StudioOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/orders/${id}`, {
      headers: { cookie },
      cache: 'no-store',
    })
  } catch {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Không thể kết nối đến máy chủ.</div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">
            <p>Vui lòng đăng nhập bằng tài khoản xưởng studio.</p>
            <a href="/login" className="workspace-btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
              Đăng nhập tài khoản xưởng
            </a>
          </div>
        </main>
      </>
    )
  }

  if (!response.ok) {
    return (
      <>
        <HomeNav />
        <main className="studio-page">
          <div className="studio-empty">Đơn hàng này không thuộc phạm vi xử lý của bạn.</div>
        </main>
      </>
    )
  }

  const order = (await response.json()) as StudioOrderItem

  return (
    <>
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7a8275', marginBottom: '8px' }}>
              <a href="/studio" style={{ color: 'inherit', textDecoration: 'none' }}>Xưởng studio</a>
              <span>/</span>
              <a href="/studio/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Đơn in ấn</a>
              <span>/</span>
              <span>#{order.orderId.slice(0, 8)}</span>
            </div>
            <h1>Xử lý đơn #{order.orderId.slice(0, 8)}</h1>
            <p>Trạng thái: <strong>{label(order.status)}</strong> {order.isFixture ? '· (Mẫu thử)' : ''}</p>
          </div>
          <div className="studio-actions">
            <a href="/studio/orders" className="workspace-btn-outline">← Danh sách đơn</a>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <section className="studio-card">
            <div className="workspace-section-head">
              <h2>Tiến độ chế tác thủ công</h2>
            </div>
            <div style={{ marginBottom: '20px', padding: '16px', background: '#faf9f5', borderRadius: '10px', border: '1px solid #e8e4da' }}>
              <div style={{ fontWeight: 600, color: '#3e4a39', marginBottom: '4px' }}>Thiệp giấy mỹ thuật</div>
              <div style={{ fontSize: '14px', color: '#555e52', marginBottom: '12px' }}>Giai đoạn hiện tại: <strong>{label(order.physicalStage)}</strong></div>
              {order.physicalStage && order.physicalStage !== 'DELIVERED' ? (
                <AdvanceOrder orderId={order.orderId} track="physical" label="Chuyển sang công đoạn giấy kế tiếp →" />
              ) : null}
            </div>

            <div style={{ padding: '16px', background: '#faf9f5', borderRadius: '10px', border: '1px solid #e8e4da' }}>
              <div style={{ fontWeight: 600, color: '#3e4a39', marginBottom: '4px' }}>Thiệp cưới số trực tuyến</div>
              <div style={{ fontSize: '14px', color: '#555e52', marginBottom: '12px' }}>Giai đoạn hiện tại: <strong>{label(order.digitalStage)}</strong></div>
              {order.digitalStage && order.digitalStage !== 'HANDED_OVER' ? (
                <AdvanceOrder orderId={order.orderId} track="digital" label="Bàn giao thiệp số trực tuyến →" />
              ) : null}
            </div>
          </section>

          <div>
            <section className="studio-card" style={{ marginBottom: '24px' }}>
              <div className="workspace-section-head">
                <h2>Yêu cầu hủy đơn ({order.cancellations.length})</h2>
              </div>
              {order.cancellations.length === 0 ? (
                <p style={{ color: '#7a8275', fontSize: '13px', margin: 0 }}>Không có yêu cầu hủy nào từ khách hàng.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.cancellations.map((row) => (
                    <li key={row.cancellationId} style={{ padding: '12px', background: '#faf9f5', borderRadius: '8px', border: '1px solid #e8e4da' }}>
                      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                        Trạng thái: <strong>{label(row.state)}</strong> · Lý do: {row.reason}
                      </div>
                      {row.state === 'REQUESTED' ? (
                        <DecideCancellation orderId={order.orderId} cancellationId={row.cancellationId} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="studio-card">
              <OrderException orderId={order.orderId} />
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
