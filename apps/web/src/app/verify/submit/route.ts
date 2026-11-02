import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const upstream = await fetch(`${apiOrigin()}/api/v1/auth/verify-email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://app.mori.localhost',
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
