import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const cookie = (await cookies()).toString()
  const body: unknown = await request.json()
  const forwarded = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const upstream = await fetch(`${apiOrigin()}/api/v1/assistant/recommendations`, {
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
