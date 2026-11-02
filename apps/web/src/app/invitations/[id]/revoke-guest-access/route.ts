import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookie = (await cookies()).toString()
  const key = request.headers.get('idempotency-key') ?? ''
  const body: unknown = await request.json()
  const upstream = await fetch(`${apiOrigin()}/api/v1/invitations/${id}/revoke-guest-access`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie,
      origin: 'http://app.mori.localhost',
      'idempotency-key': key,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
