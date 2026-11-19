import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../../lib/safe-mutation-origin'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const { id } = await params
  const cookie = (await cookies()).toString()
  const origin = process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
  const response = await fetch(`${origin}/api/v1/invitations/${encodeURIComponent(id)}/demo-payment`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      cookie,
      origin: originCheck.upstreamOrigin,
    },
    body: await request.text(),
    cache: 'no-store',
  })
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
