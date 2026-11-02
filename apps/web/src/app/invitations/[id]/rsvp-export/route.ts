import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookie = (await cookies()).toString()
  const upstream = await fetch(`${apiOrigin()}/api/v1/invitations/${id}/rsvp-export`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const payload = await upstream.text()
  return new NextResponse(payload, {
    status: upstream.status,
    headers: {
      'cache-control': 'private, no-store',
      'content-type': upstream.headers.get('content-type') ?? 'text/csv; charset=utf-8',
      'content-disposition': upstream.headers.get('content-disposition') ?? 'attachment; filename="rsvps.csv"',
    },
  })
}
