import { GUEST_COOKIE } from '@mori/contracts'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const body: unknown = await request.json()
  const upstream = await fetch(
    `${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/guest-session`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )
  const payload = (await upstream.json()) as { partyName?: string }
  const headers = new Headers({ 'cache-control': 'private, no-store' })
  const setCookie = upstream.headers.get('set-cookie')
  if (setCookie?.startsWith(`${GUEST_COOKIE}=`)) headers.set('set-cookie', setCookie)
  return new NextResponse(JSON.stringify({ partyName: payload.partyName ?? null }), {
    status: upstream.status,
    headers,
  })
}
