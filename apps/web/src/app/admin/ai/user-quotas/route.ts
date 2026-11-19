import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export async function GET() {
  const cookie = (await cookies()).toString()
  const upstream = await fetch(`${apiOrigin()}/api/v1/admin/ai-config/user-quotas`, {
    headers: { cookie },
    cache: 'no-store',
  })
  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}

export async function PUT(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const cookie = (await cookies()).toString()
  const body = (await request.json().catch(() => ({}))) as {
    userId?: string
    dailyLimit?: number | null
    defaultUserDailyLimit?: number | null
  }

  const targetUrl = body.userId
    ? `${apiOrigin()}/api/v1/admin/ai-config/user-quotas/${encodeURIComponent(body.userId)}`
    : `${apiOrigin()}/api/v1/admin/ai-config/user-quotas/default`

  const upstream = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      cookie,
      origin: originCheck.upstreamOrigin,
    },
    body: JSON.stringify(
      body.userId
        ? { dailyLimit: body.dailyLimit ?? null }
        : { defaultUserDailyLimit: body.defaultUserDailyLimit ?? null },
    ),
    cache: 'no-store',
  })

  const payload = (await upstream.text()) || '{}'
  return new NextResponse(payload, {
    status: upstream.status,
    headers: { 'cache-control': 'private, no-store', 'content-type': 'application/json' },
  })
}
