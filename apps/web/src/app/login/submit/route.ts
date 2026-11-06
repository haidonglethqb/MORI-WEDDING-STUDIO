import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new NextResponse(JSON.stringify({ code: 'BAD_REQUEST', message: 'Malformed JSON payload' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const upstream = await fetch(`${apiOrigin()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: originCheck.upstreamOrigin,
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
