import { GUEST_COOKIE } from '@mori/contracts'
import { renderInvitationHtml } from '@mori/invitation-renderer'
import { cookies } from 'next/headers'
import { GuestFragment } from './guest-fragment'
import { GuestRsvp } from './guest-rsvp'
import { ReportInvitation } from './report-invitation'
import './guest.css'

export const dynamic = 'force-dynamic'

interface OpenInvitation {
  gated?: false
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
}

interface GatedInvitation {
  gated: true
  slug: string
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="guest-page">
        <div className="guest-container">
          <div className="guest-invitation-card">
            <h1>Thiệp cưới MORI</h1>
            <p>Không thể kết nối đến máy chủ lưu trữ thiệp.</p>
          </div>
        </div>
      </main>
    )
  }

  if (!response.ok) {
    return (
      <main className="guest-page">
        <div className="guest-container">
          <div className="guest-invitation-card">
            <h1>Thiệp không còn khả dụng</h1>
            <p>Liên kết thiệp này có thể đã được thay đổi hoặc đã hết hạn.</p>
          </div>
        </div>
      </main>
    )
  }

  const body = (await response.json()) as OpenInvitation | GatedInvitation
  const guest = await grantedGuest(slug)

  if (body.gated && !guest) {
    return (
      <main className="guest-page">
        <div className="guest-container">
          <GuestFragment slug={slug} />
          <div className="guest-invitation-card">
            <span className="guest-atelier-badge">MORI ATELIER · RIÊNG TƯ</span>
            <h1>Thiệp cưới được bảo vệ</h1>
            <p>Thiệp cưới này yêu cầu liên kết mời riêng tư hoặc mã bảo mật để xem.</p>
          </div>
        </div>
      </main>
    )
  }

  const page = guest ?? (body as OpenInvitation)
  const html = renderInvitationHtml({
    template: 'editorial-ivory',
    displayNames: page.displayNames,
    eventTitle: page.eventTitle,
    greeting: page.greeting,
  })

  return (
    <main className="guest-page">
      <div className="guest-container">
        <GuestFragment slug={slug} />

        <header className="guest-header-seal">
          <span className="guest-atelier-badge">MORI ATELIER · THIỆP MỜI TRỰC TUYẾN</span>
        </header>

        <div className="guest-invitation-card">
          <div className="guest-card-inner-frame" />
          {guest ? (
            <div className="guest-greeting-pill">
              <span>Trân trọng kính mời:</span>
              <strong>{guest.partyName}</strong>
            </div>
          ) : null}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        {guest ? <GuestRsvp slug={slug} /> : null}

        <ReportInvitation slug={slug} />
      </div>
    </main>
  )
}

async function grantedGuest(slug: string): Promise<(OpenInvitation & { partyName: string }) | null> {
  const token = (await cookies()).get(GUEST_COOKIE)?.value
  if (!token) return null
  const response = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/guest`, {
    headers: { cookie: `${GUEST_COOKIE}=${token}` },
    cache: 'no-store',
  })
  if (!response.ok) return null
  return (await response.json()) as OpenInvitation & { partyName: string }
}
