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
    return <p>Thiệp này không còn xem được.</p>
  }
  if (!response.ok) {
    return <p>Thiệp này không còn xem được.</p>
  }
  const body = (await response.json()) as OpenInvitation | GatedInvitation
  const guest = await grantedGuest(slug)
  if (body.gated && !guest) {
    return (
      <>
        <GuestFragment slug={slug} />
        <p>Thiệp này cần mật khẩu.</p>
      </>
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
    <>
      <GuestFragment slug={slug} />
      {guest ? <p>Xin chào, {guest.partyName}</p> : null}
      {guest ? <GuestRsvp slug={slug} /> : null}
      <article className="guest" dangerouslySetInnerHTML={{ __html: html }} />
      <ReportInvitation slug={slug} />
    </>
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
