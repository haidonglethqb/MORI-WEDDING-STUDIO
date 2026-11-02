import { cookies } from 'next/headers'
import { AssignForm } from './assign-form'
import { IssueQuote } from './issue-quote'
import { OpenProof } from './open-proof'
import { StudioReply } from './studio-reply'
import '../../../login/login.css'

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
      <main className="login">
        <h1>Yêu cầu</h1>
        <p>Không mở được yêu cầu.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Yêu cầu</h1>
        <p>
          <a href="/login">Đăng nhập</a> bằng tài khoản xưởng.
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Yêu cầu</h1>
        <p>Không mở được yêu cầu này.</p>
      </main>
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
    <main className="login">
      <h1>{detail.internalTitle}</h1>
      <p>
        {detail.kind} · {detail.status}
      </p>
      <p>
        <a href="/studio">Về hàng đợi</a>
      </p>
      {detail.messages.length === 0 ? <p>Chưa có tin nhắn.</p> : null}
      <ul>
        {detail.messages.map((message, index) => (
          <li key={`${message.visibility}-${index}`}>
            {message.visibility === 'INTERNAL' ? 'Nội bộ' : 'Khách'}: {message.plainText}
          </li>
        ))}
      </ul>
      <OpenProof requestId={detail.requestId} />
      <IssueQuote requestId={detail.requestId} />
      <AssignForm requestId={detail.requestId} staff={staff} />
      <StudioReply requestId={detail.requestId} />
    </main>
  )
}
