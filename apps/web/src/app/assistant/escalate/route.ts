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
  const raw: unknown = await request.json().catch(() => ({}))
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const clientSessionId =
    typeof body['sessionId'] === 'string' && body['sessionId'] ? body['sessionId'] : null

  let sessionId = cookieStore.get('mori_assistant_session_id')?.value ?? clientSessionId
  let isNewSession = false
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    isNewSession = true
  }

  const allCookies = cookieStore.getAll().filter((c) => c.name !== 'mori_assistant_session_id')
  const cookiePairs = allCookies.map((c) => `${c.name}=${c.value}`)
  cookiePairs.push(`mori_assistant_session_id=${sessionId}`)

  try {
    const upstream = await fetch(`${apiOrigin()}/api/v1/assistant/escalate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: cookiePairs.join('; '),
        origin: originCheck.upstreamOrigin,
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        sessionId,
        customerContact:
          typeof body['customerContact'] === 'string'
            ? body['customerContact']
            : typeof body['contact'] === 'string'
              ? body['contact']
              : undefined,
        reason:
          typeof body['reason'] === 'string'
            ? body['reason']
            : typeof body['note'] === 'string'
              ? body['note']
              : undefined,
      }),
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
        sameSite: 'lax',
        secure: process.env['NODE_ENV'] === 'production',
        maxAge: 30 * 24 * 60 * 60,
      })
    }
    return response
  } catch {
    return NextResponse.json(
      { message: 'Không thể kết nối tới dịch vụ chuyển nhân viên tư vấn.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
