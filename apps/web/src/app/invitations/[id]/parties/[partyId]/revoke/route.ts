import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(_request: Request, context: { params: Promise<{ id: string; partyId: string }> }) {
  const { id, partyId } = await context.params
  const cookie = (await cookies()).toString()
  const upstream = await fetch(`${apiOrigin()}/api/v1/invitations/${id}/parties/${partyId}/revoke`, {
    method: 'POST',
    headers: {
      cookie,
      origin: 'http://app.mori.localhost',
    },
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
