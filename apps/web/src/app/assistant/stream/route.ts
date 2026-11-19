import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const cookieStore = await cookies()
  const raw: unknown = await request.json()
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const clientSessionId =
    typeof body['sessionId'] === 'string' && body['sessionId'] ? body['sessionId'] : null

  let sessionId = cookieStore.get('mori_assistant_session_id')?.value ?? clientSessionId
  let isNewSession = false

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    isNewSession = true
  }

  const cookiePairs = cookieStore
    .getAll()
    .filter((c) => c.name !== 'mori_assistant_session_id')
    .map((c) => `${c.name}=${c.value}`)
  cookiePairs.push(`mori_assistant_session_id=${sessionId}`)

  const upstream = await fetch(`${apiOrigin()}/api/v1/assistant/chat/stream`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: cookiePairs.join('; '),
      origin: originCheck.upstreamOrigin,
      'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '127.0.0.1',
      'x-session-id': sessionId,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '{}')
    return new NextResponse(errText || '{}', {
      status: upstream.status || 502,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  }

  const response = new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'private, no-store, no-transform',
      connection: 'keep-alive',
    },
  })

  if (isNewSession) {
    response.cookies.set('mori_assistant_session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: 30 * 24 * 60 * 60,
    })
  }

  return response
}
