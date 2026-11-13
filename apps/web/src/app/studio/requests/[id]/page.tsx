import { cookies } from 'next/headers'
import { HomeNav } from '../../../home-nav'
import { AssignForm } from './assign-form'
import { IssueQuote } from './issue-quote'
import { OpenProof } from './open-proof'
import { StudioReply } from './studio-reply'
import '../../studio.css'
import '../../../workspace/workspace.css'

export const dynamic = 'force-dynamic'

interface StudioMessage {
  visibility: 'CUSTOMER' | 'INTERNAL'
  plainText: string
}

interface StudioRequestDetail {
  requestId: string
  kind: string
  status: string
  internalTitle: string
  messages: StudioMessage[]
}

const kindLabel: Record<string, string> = {
  PAPER: 'Thiệp giấy mỹ thuật',
  DIGITAL: 'Thiệp cưới số',
  BUNDLE: 'Gói trọn bộ',
}

const statusLabel: Record<string, string> = {
  SUBMITTED: 'Chờ tiếp nhận',
  CONFIRMED: 'Đã nhận việc',
  IN_FULFILLMENT: 'Đang chế tác',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  APPROVED: 'Đang trao đổi',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function StudioRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/requests/${id}`, {
      headers: cookie ? { cookie } : {},
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
          <div className="studio-empty">Không tìm thấy yêu cầu này trong danh sách xưởng.</div>
        </main>
      </>
    )
  }

  const detail = (await response.json()) as StudioRequestDetail
  const staffResponse = await fetch(`${apiOrigin()}/api/v1/studio/staff`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const staff = staffResponse.ok
    ? ((await staffResponse.json()) as { staffUserId: string; displayName: string }[])
    : []

  return (
    <>
      <HomeNav />
      <main className="studio-page">
        <header className="studio-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7a8275', marginBottom: '8px' }}>
              <a href="/studio" style={{ color: 'inherit', textDecoration: 'none' }}>Xưởng studio</a>
              <span>/</span>
              <span>Yêu cầu #{detail.requestId.slice(0, 8)}</span>
            </div>
            <h1>{detail.internalTitle || 'Yêu cầu chế tác thiết kế'}</h1>
            <p>
              Loại: <strong>{kindLabel[detail.kind] ?? detail.kind}</strong> · Trạng thái: <strong>{statusLabel[detail.status] ?? detail.status}</strong>
            </p>
          </div>
          <div className="studio-actions">
            <a href="/studio" className="workspace-btn-outline">← Về hàng đợi xưởng</a>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div>
            <section className="studio-card" style={{ marginBottom: '24px' }}>
              <div className="workspace-section-head">
                <h2>Trao đổi yêu cầu ({detail.messages.length})</h2>
              </div>
              {detail.messages.length === 0 ? (
                <div className="studio-empty" style={{ padding: '24px' }}>Chưa có tin nhắn trao đổi.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {detail.messages.map((message, index) => (
                    <div
                      key={`${message.visibility}-${index}`}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: message.visibility === 'INTERNAL' ? '#f4f6f3' : '#ffffff',
                        border: '1px solid #e5dfd2',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: message.visibility === 'INTERNAL' ? '#55634f' : '#b38e46', textTransform: 'uppercase' }}>
                          {message.visibility === 'INTERNAL' ? '✦ Ghi chú nội bộ xưởng' : '✉ Khách hàng gửi'}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#242c22' }}>
                        {message.plainText}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <StudioReply requestId={detail.requestId} />
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section className="studio-card">
              <div className="workspace-section-head">
                <h2>Bản mẫu thiết kế (Proof)</h2>
              </div>
              <OpenProof requestId={detail.requestId} />
            </section>

            <section className="studio-card">
              <div className="workspace-section-head">
                <h2>Báo giá &amp; Dự toán</h2>
              </div>
              <IssueQuote requestId={detail.requestId} />
            </section>

            <section className="studio-card">
              <div className="workspace-section-head">
                <h2>Phân công nghệ nhân</h2>
              </div>
              <AssignForm requestId={detail.requestId} staff={staff} />
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
