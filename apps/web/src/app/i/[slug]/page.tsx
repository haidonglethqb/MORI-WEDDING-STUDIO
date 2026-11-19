import { GUEST_COOKIE, type PublicInvitation } from '@mori/contracts'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { DigitalInvitationView } from './digital-invitation-view'
import { GuestFragment } from './guest-fragment'
import { GuestRsvp } from './guest-rsvp'
import { PasscodeForm } from './passcode-form'
import { ReportInvitation } from './report-invitation'
import '../../../features/digital-templates/digital-templates.css'
import '../../../features/digital-templates/digital-templates-themes.css'
import './guest.css'

export const dynamic = 'force-dynamic'

type OpenInvitation = PublicInvitation & { gated?: false }

interface GatedInvitation {
  gated: true
  slug: string
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

async function grantedGuest(slug: string): Promise<(OpenInvitation & { partyName: string }) | null> {
  const token = (await cookies()).get(GUEST_COOKIE)?.value
  if (!token) return null
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/guest`, {
      headers: { cookie: `${GUEST_COOKIE}=${token}` },
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as OpenInvitation & { partyName: string }
  } catch {
    return null
  }
}

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let response: Response | null = null
  try {
    response = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    })
  } catch {
    response = null
  }

  if (!response || !response.ok) {
    notFound()
  }

  const body = (await response.json()) as OpenInvitation | GatedInvitation
  const guest = await grantedGuest(slug)

  if (body.gated && !guest) {
    return (
      <main className="guest-page">
        <div className="guest-container">
          <GuestFragment slug={slug} />
          <div className="guest-invitation-card">
            <span className="guest-atelier-badge">MORI ATELIER · BẢO MẬT</span>
            <PasscodeForm slug={slug} />
          </div>
        </div>
      </main>
    )
  }

  const page = guest ?? (body as OpenInvitation)

  return (
    <main className="guest-page">
      <div className="guest-container">
        <GuestFragment slug={slug} />

        <header className="guest-header-seal">
          <span className="guest-atelier-badge">MORI · THIỆP MỜI TRỰC TUYẾN</span>
        </header>

        <DigitalInvitationView
          slug={slug}
          invitation={page}
          partyName={guest?.partyName ?? null}
          rsvpSection={<GuestRsvp slug={slug} />}
        />

        <ReportInvitation slug={slug} />
      </div>
    </main>
  )
}
