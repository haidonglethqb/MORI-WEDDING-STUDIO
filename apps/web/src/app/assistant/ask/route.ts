import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const raw: unknown = await request.json()
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const clientSessionId =
    typeof body['sessionId'] === 'string' && body['sessionId'] ? body['sessionId'] : null

  let sessionId = clientSessionId ?? cookieStore.get('mori_assistant_session_id')?.value
  let isNewSession = false

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    isNewSession = true
  }

  const allCookies = cookieStore.getAll()
  const filtered = allCookies.filter((c) => c.name !== 'mori_assistant_session_id')
  const cookiePairs = filtered.map((c) => `${c.name}=${c.value}`)
  cookiePairs.push(`mori_assistant_session_id=${sessionId}`)
  const upstreamCookie = cookiePairs.join('; ')

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
      'x-session-id': sessionId,
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
