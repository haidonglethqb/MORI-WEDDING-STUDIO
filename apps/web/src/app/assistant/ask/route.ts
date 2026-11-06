import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const cookie = (await cookies()).toString()
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
      cookie,
      origin: 'http://app.mori.localhost',
      'x-forwarded-for': forwarded,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
