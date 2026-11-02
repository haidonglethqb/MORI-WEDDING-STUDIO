import { cookies } from 'next/headers'
import { ApproveProof } from './approve-proof'
import { CustomerReply } from './customer-reply'
import { PlaceOrderButton } from './place-order'
import '../../login/login.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function CustomerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/requests/${id}/messages`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Yêu cầu của tôi</h1>
        <p>Không mở được trao đổi.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Yêu cầu của tôi</h1>
        <p>
          <a href="/login">Đăng nhập</a> để xem trao đổi.
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Yêu cầu của tôi</h1>
        <p>Không mở được trao đổi này.</p>
      </main>
    )
  }
  const messages = (await response.json()) as { plainText: string }[]
  const proofsResponse = await fetch(`${apiOrigin()}/api/v1/requests/${id}/revisions`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const quotesResponse = await fetch(`${apiOrigin()}/api/v1/requests/${id}/quotes`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const quotes = quotesResponse.ok
    ? ((await quotesResponse.json()) as {
        quoteId: string
        state: string
        totalAmountVnd: string
        isFixture: boolean
        requestVersion: number
        requestKind: string
      }[])
    : []
  const addressResponse = await fetch(`${apiOrigin()}/api/v1/me/addresses`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const addresses = addressResponse.ok
    ? ((await addressResponse.json()) as { addressId: string; recipientName: string; locality: string }[])
    : []
  const proofs = proofsResponse.ok
    ? ((await proofsResponse.json()) as {
        revisionId: string
        sequence: number
        state: string
        manifestHash: string
      }[])
    : []
  return (
    <main className="login">
      <h1>Yêu cầu của tôi</h1>
      <p>
        <a href="/workspace">Về việc của tôi</a>
      </p>
      <h2>Báo giá</h2>
      {quotes.length === 0 ? <p>Chưa có báo giá.</p> : null}
      <ul>
        {quotes.map((quote) => (
          <li key={quote.quoteId}>
            {quote.totalAmountVnd} VND · {quote.state}
            {quote.isFixture ? ' · Mẫu thử' : ''}
            {quote.state === 'ISSUED' ? (
              <PlaceOrderButton
                requestId={id}
                quoteId={quote.quoteId}
                expectedVersion={quote.requestVersion}
                totalAmountVnd={quote.totalAmountVnd}
                requestKind={quote.requestKind}
                addresses={addresses}
              />
            ) : null}
          </li>
        ))}
      </ul>
      <h2>Bản in</h2>
      {proofs.length === 0 ? <p>Chưa có bản in.</p> : null}
      <ul>
        {proofs.map((proof) => (
          <li key={proof.revisionId}>
            Bản {proof.sequence} · {proof.state}
            {proof.state === 'IN_REVIEW' ? (
              <ApproveProof
                requestId={id}
                revisionId={proof.revisionId}
                sequence={proof.sequence}
                manifestHash={proof.manifestHash}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {messages.length === 0 ? <p>Chưa có tin nhắn.</p> : null}
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.plainText}</li>
        ))}
      </ul>
      <CustomerReply requestId={id} />
    </main>
  )
}
