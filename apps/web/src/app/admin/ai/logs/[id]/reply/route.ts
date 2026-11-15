import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const { id } = await params
  const cookie = (await cookies()).toString()
  const raw: unknown = await request.json().catch(() => ({}))
  const body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const msgField = typeof body['message'] === 'string' ? body['message'] : ''
  const contentField = typeof body['content'] === 'string' ? body['content'] : ''
  const text = (msgField || contentField).trim()

  if (!text) {
    return NextResponse.json(
      { message: 'Vui lòng nhập nội dung phản hồi tới khách hàng.' },
      { status: 400, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  try {
    const upstream = await fetch(
      `${apiOrigin()}/api/v1/admin/ai-config/sessions/${encodeURIComponent(id)}/reply`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          origin: originCheck.upstreamOrigin,
        },
        body: JSON.stringify({
          message: text,
          content: text,
          adminName: body['adminName'] ?? 'Nhân viên tư vấn MORI',
        }),
        cache: 'no-store',
      },
    )

    const payload = (await upstream.text()) || '{}'
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { message: 'Không thể gửi phản hồi tới máy chủ API.' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    )
  }
}
