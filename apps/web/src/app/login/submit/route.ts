import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const upstream = await fetch(`${apiOrigin()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://app.mori.localhost',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  const headers = new Headers({
    'cache-control': 'private, no-store',
    'content-type': 'application/json',
  })
  const setCookie = upstream.headers.get('set-cookie')
  if (setCookie?.includes('__Host-mori_session=')) headers.set('set-cookie', setCookie)
  return new NextResponse(payload, { status: upstream.status, headers })
}
