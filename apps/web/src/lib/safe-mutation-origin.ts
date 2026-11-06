import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = new Set([
  'http://app.mori.localhost',
  'http://invite.mori.localhost',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

export function validateBffOrigin(request: Request): {
  ok: true
  upstreamOrigin: string
} | {
  ok: false
  response: NextResponse
} {
  const origin = request.headers.get('origin')
  if (origin) {
    if (!ALLOWED_ORIGINS.has(origin)) {
      return {
        ok: false,
        response: new NextResponse(
          JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Forbidden origin' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        ),
      }
    }
    const upstreamOrigin =
      origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
        ? 'http://app.mori.localhost'
        : origin
    return { ok: true, upstreamOrigin }
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const parsedOrigin = new URL(referer).origin
      if (!ALLOWED_ORIGINS.has(parsedOrigin)) {
        return {
          ok: false,
          response: new NextResponse(
            JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Forbidden referer' }),
            { status: 403, headers: { 'content-type': 'application/json' } },
          ),
        }
      }
    } catch {
      return {
        ok: false,
        response: new NextResponse(
          JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Malformed referer' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        ),
      }
    }
  }

  return { ok: true, upstreamOrigin: 'http://app.mori.localhost' }
}
