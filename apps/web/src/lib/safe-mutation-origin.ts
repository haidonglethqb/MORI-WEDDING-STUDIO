import { NextResponse } from 'next/server'

function getAllowedOrigins(request?: Request): Set<string> {
  const allowed = new Set([
    'http://app.mori.localhost',
    'http://invite.mori.localhost',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
  if (process.env['PUBLIC_APP_ORIGIN']) {
    allowed.add(process.env['PUBLIC_APP_ORIGIN'].trim().replace(/\/+$/, ''))
  }
  if (process.env['PUBLIC_INVITE_ORIGIN']) {
    allowed.add(process.env['PUBLIC_INVITE_ORIGIN'].trim().replace(/\/+$/, ''))
  }
  if (request) {
    const host = request.headers.get('host')
    if (host) {
      allowed.add(`http://${host}`)
      allowed.add(`https://${host}`)
    }
  }
  return allowed
}

function resolveUpstreamOrigin(origin: string): string {
  const configured = process.env['PUBLIC_APP_ORIGIN']?.trim().replace(/\/+$/, '')
  if (configured) return configured
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return 'http://app.mori.localhost'
  }
  return origin
}

export function validateBffOrigin(request: Request): {
  ok: true
  upstreamOrigin: string
} | {
  ok: false
  response: NextResponse
} {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'cross-site') {
    return {
      ok: false,
      response: new NextResponse(
        JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Cross-site request rejected' }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      ),
    }
  }

  const allowed = getAllowedOrigins(request)
  const origin = request.headers.get('origin')
  if (origin) {
    if (!allowed.has(origin)) {
      return {
        ok: false,
        response: new NextResponse(
          JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Forbidden origin' }),
          { status: 403, headers: { 'content-type': 'application/json' } },
        ),
      }
    }
    return { ok: true, upstreamOrigin: resolveUpstreamOrigin(origin) }
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const parsedOrigin = new URL(referer).origin
      if (!allowed.has(parsedOrigin)) {
        return {
          ok: false,
          response: new NextResponse(
            JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Forbidden referer' }),
            { status: 403, headers: { 'content-type': 'application/json' } },
          ),
        }
      }
      return { ok: true, upstreamOrigin: resolveUpstreamOrigin(parsedOrigin) }
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

  return {
    ok: false,
    response: new NextResponse(
      JSON.stringify({ code: 'CROSS_SITE_REJECTED', message: 'Missing origin and referer headers' }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    ),
  }
}
