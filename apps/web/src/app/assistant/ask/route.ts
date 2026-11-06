import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('mori_assistant_session_id')?.value
  let isNewSession = false

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    isNewSession = true
  }

  const existingCookieStr = cookieStore.toString()
  const upstreamCookie = existingCookieStr.includes('mori_assistant_session_id')
    ? existingCookieStr
    : `${existingCookieStr ? `${existingCookieStr}; ` : ''}mori_assistant_session_id=${sessionId}`

  const raw: unknown = await request.json()
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const forwarded = request.headers.get('x-forwarded-for') ?? '127.0.0.1'

  const endpoint =
    typeof body['message'] === 'string'
      ? `${apiOrigin()}/api/v1/assistant/chat`
      : `${apiOrigin()}/api/v1/assistant/recommendations`

  const upstream = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: upstreamCookie,
      origin: 'http://app.mori.localhost',
      'x-forwarded-for': forwarded,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const payload = (await upstream.text()) || '{}'
  const response = new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })

  if (isNewSession) {
    response.cookies.set('mori_assistant_session_id', sessionId, {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    })
  }

  return response
}
