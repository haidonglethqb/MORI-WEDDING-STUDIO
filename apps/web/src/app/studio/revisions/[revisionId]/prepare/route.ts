import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

async function forward(revisionId: string, path: string, body: unknown, upstreamOrigin: string) {
  const cookie = (await cookies()).toString()
  const upstream = await fetch(`${apiOrigin()}/api/v1/studio/revisions/${revisionId}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie,
      origin: upstreamOrigin,
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

export async function POST(request: Request, context: { params: Promise<{ revisionId: string }> }) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const { revisionId } = await context.params
  return forward(revisionId, 'prepare', await request.json(), originCheck.upstreamOrigin)
}
