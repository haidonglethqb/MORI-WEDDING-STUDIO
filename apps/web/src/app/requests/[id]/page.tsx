import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
import { AtelierCrumbs } from '../../../components/atelier-crumbs'
import { ApproveProof } from './approve-proof'
import { CustomerReply } from './customer-reply'
import { PlaceOrderButton } from './place-order'
import { proofStateLabel, quoteStateLabel } from './request-labels'
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
      <><HomeNav /><main className="request-detail-page"><div className="atelier-empty">Không mở được trao đổi.</div></main></>
    )
  }

  if (response.status === 401) {
    return (
      <><HomeNav /><main className="request-detail-page"><div className="atelier-empty"><p>Vui lòng đăng nhập để xem yêu cầu thiết kế của bạn.</p><a href="/login" className="workspace-btn-primary">Đăng nhập</a></div></main></>
    )
  }

  if (!response.ok) {
    return (
      <><HomeNav /><main className="request-detail-page"><div className="atelier-empty">Yêu cầu này không tồn tại hoặc bạn không có quyền xem.</div></main></>
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
        <AtelierCrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Việc của tôi', href: '/workspace' }, { label: `Yêu cầu #${id.slice(0, 8)}` }]} />

        <header className="request-detail-header">
          <div>
            <span className="atelier-eyebrow">Hồ sơ may đo · #{id.slice(0, 8)}</span>
            <h1>Trao đổi cùng xưởng MORI</h1>
            <p>Nhận báo giá, duyệt bản in mẫu và gửi đơn chế tác — mọi bước đều được lưu lại tại đây.</p>
          </div>
        </header>

        <section className="request-section-card">
          <h2 className="request-section-title">
            <span>Báo giá từ xưởng ({quotes.length})</span>
            <span className="atelier-section-note">Bước 1</span>
          </h2>
          {quotes.length === 0 ? (
            <p className="atelier-empty atelier-empty--inline">Nghệ nhân đang tính toán định lượng giấy và chi phí ép kim cho bạn.</p>
          ) : (
            quotes.map((quote) => (
              <div key={quote.quoteId} className="quote-item-card">
                <div>
                  <strong className="atelier-amount">{Number(quote.totalAmountVnd).toLocaleString('vi-VN')} ₫</strong>
                  <span className="atelier-meta-row">
                    <span className={`atelier-state ${quote.state}`}>{quoteStateLabel[quote.state] ?? quote.state}</span>
                    {quote.isFixture ? <span>Mẫu thử</span> : null}
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
                    isReadyToOrder={quote.requestKind === 'DIGITAL' || proofs.some((p) => p.state === 'APPROVED')}
                  />
                )}
              </div>
            ))
          )}
        </section>

        <section className="request-section-card">
          <h2 className="request-section-title">
            <span>Bản in mẫu cần duyệt</span>
            <span className="atelier-section-note">Bước 2</span>
          </h2>
          {proofs.length === 0 ? (
            <p className="atelier-empty atelier-empty--inline">Chưa có bản in mẫu nào được tải lên từ xưởng.</p>
          ) : (
            proofs.map((proof) => (
              <div key={proof.revisionId} className="proof-item-card">
                <div>
                  <strong>Bản in đợt #{proof.sequence}</strong>
                  <span className="atelier-meta-row">
                    <span className={`atelier-state ${proof.state}`}>{proofStateLabel[proof.state] ?? proof.state}</span>
                  </span>
                </div>
                {proof.state === 'IN_REVIEW' && (
                  <ApproveProof requestId={id} revisionId={proof.revisionId} sequence={proof.sequence} manifestHash={proof.manifestHash} />
                )}
              </div>
            ))
          )}
        </section>

        <section className="request-section-card">
          <h2 className="request-section-title">
            <span>Nhật ký trao đổi ({messages.length})</span>
            <span className="atelier-section-note">Luôn mở</span>
          </h2>
          {messages.length === 0 ? (
            <p className="atelier-empty atelier-empty--inline">Chưa có tin nhắn nào. Bạn có thể gửi phản hồi bên dưới.</p>
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
