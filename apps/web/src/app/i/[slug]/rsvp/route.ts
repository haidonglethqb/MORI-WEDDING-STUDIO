import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

async function forward(slug: string, method: 'GET' | 'POST', body?: unknown) {
  const cookie = (await cookies()).toString()
  const upstream = await fetch(`${apiOrigin()}/api/v1/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
    method,
    headers: {
      cookie,
      origin: 'http://invite.mori.localhost',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  return forward(slug, 'GET')
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  return forward(slug, 'POST', await request.json())
}
