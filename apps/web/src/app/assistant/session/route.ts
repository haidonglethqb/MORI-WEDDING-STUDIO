import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cookieStore = await cookies()
  const querySessionId = searchParams.get('sessionId')?.trim()
  const cookieSessionId = cookieStore.get('mori_assistant_session_id')?.value?.trim()
  const sessionId = querySessionId || cookieSessionId || ''

  if (!sessionId) {
    return NextResponse.json(
      { message: 'Thiếu sessionId' },
      { status: 400, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  try {
    const upstream = await fetch(
      `${apiOrigin()}/api/v1/assistant/session?sessionId=${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          cookie: cookieStore.toString(),
          'x-session-id': sessionId,
        },
        cache: 'no-store',
      },
    )

    const payload = (await upstream.text()) || '{}'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể đồng bộ phiên chat.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
