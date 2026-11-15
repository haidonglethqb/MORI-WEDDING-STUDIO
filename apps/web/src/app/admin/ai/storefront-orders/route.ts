import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET() {
  const cookie = (await cookies()).toString()
  try {
    const upstream = await fetch(`${apiOrigin()}/api/v1/storefront/orders`, {
      method: 'GET',
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    const payload = (await upstream.text()) || '[]'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể tải danh sách đơn hàng từ máy chủ.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
