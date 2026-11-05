import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
import { ApproveProof } from './approve-proof'
import { CustomerReply } from './customer-reply'
import { PlaceOrderButton } from './place-order'
import './request-detail.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

interface QuoteItem {
  quoteId: string
  state: string
  totalAmountVnd: string
  isFixture: boolean
  requestVersion: number
  requestKind: string
}

interface ProofItem {
  revisionId: string
  sequence: number
  state: string
  manifestHash: string
}

export default async function CustomerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response

  try {
    response = await fetch(`${apiOrigin()}/api/v1/requests/${id}/messages`, { headers: cookie ? { cookie } : {}, cache: 'no-store' })
  } catch {
    return (
      <><HomeNav /><main className="request-detail-page"><div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>Không mở được trao đổi.</div></main></>
    )
  }

  if (response.status === 401) {
    return (
      <><HomeNav /><main className="request-detail-page"><div style={{ textAlign: 'center', padding: '60px 0' }}><p>Vui lòng đăng nhập để xem yêu cầu thiết kế của bạn.</p><a href="/login" style={{ display: 'inline-block', marginTop: '12px', padding: '8px 20px', background: '#3e4a39', color: '#fff', borderRadius: '999px', textDecoration: 'none' }}>Đăng nhập</a></div></main></>
    )
  }

  if (!response.ok) {
    return (
      <><HomeNav /><main className="request-detail-page"><div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>Yêu cầu này không tồn tại hoặc bạn không có quyền xem.</div></main></>
    )
  }

  const messages = (await response.json()) as { plainText: string }[]
  const proofsRes = await fetch(`${apiOrigin()}/api/v1/requests/${id}/revisions`, { headers: { cookie }, cache: 'no-store' })
  const quotesRes = await fetch(`${apiOrigin()}/api/v1/requests/${id}/quotes`, { headers: { cookie }, cache: 'no-store' })
  const addressRes = await fetch(`${apiOrigin()}/api/v1/me/addresses`, { headers: { cookie }, cache: 'no-store' })
  const quotes = quotesRes.ok ? ((await quotesRes.json()) as QuoteItem[]) : []
  const addresses = addressRes.ok ? ((await addressRes.json()) as { addressId: string; recipientName: string; locality: string }[]) : []
  const proofs = proofsRes.ok ? ((await proofsRes.json()) as ProofItem[]) : []

  return (
    <>
      <HomeNav />
      <main className="request-detail-page">
        <div style={{ fontSize: '13px', color: '#7a8274', marginBottom: '20px' }}>
          <a href="/" style={{ color: '#55634f', textDecoration: 'none' }}>Trang chủ</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <a href="/workspace" style={{ color: '#55634f', textDecoration: 'none' }}>Việc của tôi</a>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#242823' }}>Yêu cầu #{id.slice(0, 8)}</span>
        </div>

        <header className="request-detail-header">
          <h1>Hồ sơ may đo #{id.slice(0, 8)}</h1>
          <p style={{ margin: 0, color: '#687063', fontSize: '14px' }}>
            Trao đổi trực tiếp cùng nghệ nhân xưởng MORI về mẫu phác thảo và duyệt bản in mẫu.
          </p>
        </header>

        <section className="request-section-card">
          <h2 className="request-section-title">
            <span>Báo giá từ xưởng ({quotes.length})</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#b38e46' }}>ATELIER QUOTE</span>
          </h2>
          {quotes.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#7a8274', margin: 0 }}>Nghệ nhân đang tính toán định lượng giấy và chi phí ép kim cho bạn.</p>
          ) : (
            quotes.map((quote) => (
              <div key={quote.quoteId} className="quote-item-card">
                <div>
                  <strong style={{ fontSize: '18px', color: '#2e4a2a' }}>
                    {Number(quote.totalAmountVnd).toLocaleString('vi-VN')} ₫
                  </strong>
                  <span style={{ fontSize: '12px', marginLeft: '10px', color: '#687063' }}>
                    Trạng thái: {quote.state} {quote.isFixture ? '· Mẫu thử' : ''}
                  </span>
                </div>
                {quote.state === 'ISSUED' && (
                  <PlaceOrderButton
                    requestId={id}
                    quoteId={quote.quoteId}
                    expectedVersion={quote.requestVersion}
                    totalAmountVnd={quote.totalAmountVnd}
                    requestKind={quote.requestKind}
                    addresses={addresses}
                  />
                )}
              </div>
            ))
          )}
        </section>

        <section className="request-section-card">
          <h2 className="request-section-title">Bản in mẫu duyệt (Proofs &amp; Revisions)</h2>
          {proofs.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#7a8274', margin: 0 }}>Chưa có bản in mẫu nào được tải lên từ xưởng.</p>
          ) : (
            proofs.map((proof) => (
              <div key={proof.revisionId} className="proof-item-card">
                <div>
                  <strong>Bản in đợt #{proof.sequence}</strong>
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>Trạng thái: {proof.state}</span>
                </div>
                {proof.state === 'IN_REVIEW' && (
                  <ApproveProof requestId={id} revisionId={proof.revisionId} sequence={proof.sequence} manifestHash={proof.manifestHash} />
                )}
              </div>
            ))
          )}
        </section>

        <section className="request-section-card">
          <h2 className="request-section-title">Nhật ký trao đổi cùng xưởng</h2>
          {messages.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#7a8274', marginBottom: '20px' }}>Chưa có tin nhắn nào. Bạn có thể gửi phản hồi bên dưới.</p>
          ) : (
            <div className="message-bubble-list">
              {messages.map((m, idx) => (
                <div key={idx} className="message-bubble">{m.plainText}</div>
              ))}
            </div>
          )}
          <CustomerReply requestId={id} />
        </section>
      </main>
    </>
  )
}
