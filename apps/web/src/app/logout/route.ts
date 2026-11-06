import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@mori/contracts'
import { validateBffOrigin } from '../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

function resolveRedirectUrl(request: Request): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000'
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  const cleanHost = host.startsWith('0.0.0.0') ? host.replace('0.0.0.0', 'localhost') : host
  return `${proto}://${cleanHost}/login`
}

async function performLogout(request: Request, upstreamOrigin: string) {
  const cookie = request.headers.get('cookie') ?? ''
  try {
    await fetch(`${apiOrigin()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: upstreamOrigin,
        cookie,
      },
      cache: 'no-store',
    })
  } catch {
    // network fallback
  }

  const response = NextResponse.redirect(resolveRedirectUrl(request))
  response.cookies.delete(SESSION_COOKIE)
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  response.headers.set('cache-control', 'private, no-store')
  return response
}

export async function GET(request: Request) {
  return performLogout(request, 'http://app.mori.localhost')
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response
  return performLogout(request, originCheck.upstreamOrigin)
}
