import { cookies } from 'next/headers'
import { EditorForm, type EditorDraft } from './editor-form'
import { ExcludeReply } from './exclude-reply'
import { GuestPartyForm } from './guest-party-form'
import './editor.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function InvitationEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/invitations/${id}/editor`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="editor">
        <h1>Soạn thiệp</h1>
        <p>Không mở được bản nháp.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="editor">
        <h1>Soạn thiệp</h1>
        <p>
          <a href="/login">Đăng nhập</a> để soạn thiệp của bạn.
        </p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="editor">
        <h1>Soạn thiệp</h1>
        <p>Không mở được bản nháp.</p>
      </main>
    )
  }
  const draft = (await response.json()) as EditorDraft
  const rsvpResponse = await fetch(`${apiOrigin()}/api/v1/invitations/${id}/rsvps`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const replies = rsvpResponse.ok
    ? ((await rsvpResponse.json()) as {
        partyId: string
        partyName: string
        status: string
        attendeeCount: number
        excluded: boolean
        eventId: string | null
        version: number
      }[])
    : []
  const statusLabel: Record<string, string> = {
    ATTENDING: 'Tham dự',
    DECLINED: 'Không tham dự',
    UNANSWERED: 'Chưa trả lời',
  }
  return (
    <>
      <EditorForm draft={draft} />
      <GuestPartyForm invitationId={id} />
      <section className="editor">
        <h2>Lời đáp</h2>
        <p>
          <a href={`/invitations/${id}/rsvp-export`}>Tải lời đáp</a>
        </p>
        {replies.length === 0 ? <p>Chưa có nhóm khách.</p> : null}
        <ul>
          {replies.map((reply) => (
            <ExcludeReply
              key={reply.partyId}
              invitationId={id}
              partyId={reply.partyId}
              partyName={reply.partyName}
              excluded={reply.excluded}
              eventId={reply.eventId}
              version={reply.version}
              statusLabel={`${statusLabel[reply.status] ?? reply.status}${reply.status === 'ATTENDING' ? ` · ${reply.attendeeCount}` : ''}`}
            />
          ))}
        </ul>
      </section>
    </>
  )
}
