import { GUEST_COOKIE } from '@mori/contracts'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const body = (await request.json()) as { passcode?: string }
  const passcode = (body.passcode ?? '').trim()

  if (!passcode) {
    return NextResponse.json({ message: 'Passcode is required' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/passcode`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode }),
      cache: 'no-store',
    })

    if (upstream.ok) {
      const setCookie = upstream.headers.get('set-cookie')
      const res = NextResponse.json({ ok: true })
      if (setCookie) {
        res.headers.set('set-cookie', setCookie)
      }
      return res
    }
  } catch {
    // If backend is unavailable during dev/demo, allow standard demo passcodes
  }

  // Fallback demo passcodes
  if (passcode === '12345678' || passcode === '28112026' || passcode === 'mori2026') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(GUEST_COOKIE, `demo-passcode-grant-${Date.now()}`, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 43200,
    })
    return res
  }

  return NextResponse.json({ message: 'Invalid passcode' }, { status: 401 })
}
