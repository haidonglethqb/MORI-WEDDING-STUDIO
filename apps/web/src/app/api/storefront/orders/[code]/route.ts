import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const cookie = (await cookies()).toString()
  const upstream = await fetch(
    `${apiOrigin()}/api/v1/storefront/orders/${encodeURIComponent(code)}`,
    {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    },
  )
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const { code } = await params
  const cookie = (await cookies()).toString()
  const body = await request.text()

  const upstream = await fetch(
    `${apiOrigin()}/api/v1/storefront/orders/${encodeURIComponent(code)}`,
    {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie,
        origin: originCheck.upstreamOrigin,
      },
      body: body || '{}',
      cache: 'no-store',
    },
  )

  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
