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
    return NextResponse.json(
      { message: upstream.status === 401 ? 'Mã truy cập không chính xác' : 'Không thể xác minh mã truy cập' },
      { status: upstream.status === 401 ? 401 : 502 },
    )
  } catch {
    return NextResponse.json({ message: 'Không thể kết nối để xác minh mã truy cập' }, { status: 503 })
  }
}
