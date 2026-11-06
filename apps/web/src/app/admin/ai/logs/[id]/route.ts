import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const { id } = await params
  const cookie = (await cookies()).toString()
  const upstream = await fetch(
    `${apiOrigin()}/api/v1/admin/ai-config/sessions/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: {
        cookie,
        origin: originCheck.upstreamOrigin,
      },
      cache: 'no-store',
    },
  )
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
