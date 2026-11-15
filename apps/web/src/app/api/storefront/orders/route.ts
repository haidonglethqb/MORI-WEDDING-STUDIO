import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(request: Request) {
  const cookie = (await cookies()).toString()
  const search = new URL(request.url).search
  try {
    const upstream = await fetch(`${apiOrigin()}/api/v1/storefront/orders${search}`, {
      method: 'GET',
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    const payload = (await upstream.text()) || '{}'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể kết nối máy chủ đơn hàng.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Dữ liệu đơn hàng không hợp lệ.' },
      { status: 400, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  const cookie = (await cookies()).toString()
  const idempotencyKey = request.headers.get('idempotency-key') ?? crypto.randomUUID()

  try {
    const upstream = await fetch(`${apiOrigin()}/api/v1/storefront/orders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: originCheck.upstreamOrigin,
        'idempotency-key': idempotencyKey,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const payload = (await upstream.text()) || '{}'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể kết nối máy chủ đặt hàng. Vui lòng thử lại.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
