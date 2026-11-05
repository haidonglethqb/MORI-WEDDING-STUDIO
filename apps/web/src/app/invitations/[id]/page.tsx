import { cookies } from 'next/headers'
import { HomeNav } from '../../home-nav'
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
      <>
        <HomeNav />
        <main className="editor-page">
          <div className="editor-card">
            <h1>Soạn thiệp cưới</h1>
            <p>Không thể kết nối đến máy chủ lưu trữ bản nháp.</p>
          </div>
        </main>
      </>
    )
  }

  if (response.status === 401) {
    return (
      <>
        <HomeNav />
        <main className="editor-page">
          <div className="editor-card">
            <h1>Soạn thiệp cưới</h1>
            <p>
              Vui lòng <a href="/login" style={{ color: '#3e4a39', fontWeight: 600 }}>đăng nhập</a> để chỉnh sửa thiệp.
            </p>
          </div>
        </main>
      </>
    )
  }

  if (!response.ok) {
    return (
      <>
        <HomeNav />
        <main className="editor-page">
          <div className="editor-card">
            <h1>Soạn thiệp cưới</h1>
            <p>Không tìm thấy bản nháp hoặc thiệp này không thuộc quyền của bạn.</p>
          </div>
        </main>
      </>
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
      <HomeNav />
      <main className="editor-page">
        <header className="editor-header">
          <nav className="editor-breadcrumbs">
            <a href="/">Trang chủ</a>
            <span>/</span>
            <a href="/workspace">Không gian làm việc</a>
            <span>/</span>
            <span>Soạn thiệp cưới số</span>
          </nav>
          <div className="editor-title-row">
            <div>
              <h1>Soạn thiệp cưới trực tuyến</h1>
              <p className="editor-subtitle">
                Tùy chỉnh thông tin cô dâu, chú rể, lời mời và quản lý danh sách khách phản hồi.
              </p>
            </div>
          </div>
        </header>

        <div className="editor-grid">
          <div>
            <EditorForm draft={draft} />
          </div>

          <div>
            <GuestPartyForm invitationId={id} />

            <section className="editor-card">
              <div className="editor-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="editor-card-title">Danh sách lời đáp ({replies.length})</h2>
                  <a href={`/invitations/${id}/rsvp-export`} className="editor-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Tải danh sách Excel/CSV
                  </a>
                </div>
                <p className="editor-card-desc">Khách mời đã nhận liên kết và gửi phản hồi tham dự.</p>
              </div>

              {replies.length === 0 ? (
                <p style={{ color: '#7a8275', fontSize: '13px', margin: 0 }}>Chưa có khách mời nào gửi lời đáp.</p>
              ) : null}

              <ul className="editor-reply-list">
                {replies.map((reply) => (
                  <ExcludeReply
                    key={reply.partyId}
                    invitationId={id}
                    partyId={reply.partyId}
                    partyName={reply.partyName}
                    excluded={reply.excluded}
                    eventId={reply.eventId}
                    version={reply.version}
                    statusLabel={`${statusLabel[reply.status] ?? reply.status}${reply.status === 'ATTENDING' ? ` · ${reply.attendeeCount} khách` : ''}`}
                  />
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
