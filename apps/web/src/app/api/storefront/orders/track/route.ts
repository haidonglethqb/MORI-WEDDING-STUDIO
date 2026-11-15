import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get('code') ?? '').trim()
  const contact = (searchParams.get('contact') ?? '').trim()

  if (!code || !contact) {
    return NextResponse.json(
      { message: 'Bạn vui lòng nhập đầy đủ mã đơn hàng và thông tin liên hệ nhé!' },
      { status: 400, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  const cookie = (await cookies()).toString()
  const upstreamUrl =
    `${apiOrigin()}/api/v1/storefront/orders/track` +
    `?code=${encodeURIComponent(code)}&contact=${encodeURIComponent(contact)}`

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
    const payload = (await upstream.text()) || '{}'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        'cache-control': 'private, no-store',
        'content-type': 'application/json',
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể kết nối tới máy chủ tra cứu đơn hàng.' },
      { status: 502, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
