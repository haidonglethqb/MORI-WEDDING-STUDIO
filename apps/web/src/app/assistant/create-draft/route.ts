import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

interface DraftRequestBody {
  templateId?: 'editorial-vogue' | 'heritage-palace' | 'botanical-zen'
  groomName?: string
  brideName?: string
  eventTitle?: string
  weddingDate?: string
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  greeting?: string
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const body = (await request.json().catch(() => ({}))) as DraftRequestBody
  const cookie = (await cookies()).toString()
  const headers = {
    cookie,
    origin: originCheck.upstreamOrigin,
  }

  const createRes = await fetch(`${apiOrigin()}/api/v1/invitations/mine`, {
    method: 'POST',
    headers: { ...headers, 'idempotency-key': crypto.randomUUID() },
    cache: 'no-store',
  })

  if (createRes.status === 401) {
    return NextResponse.json(
      { ok: false, requiresAuth: true },
      { status: 401, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  if (!createRes.ok) {
    return NextResponse.json(
      { ok: false, message: 'Chưa thể khởi tạo bản nháp thiệp lúc này.' },
      { status: createRes.status, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  const created = (await createRes.json()) as { invitationId?: string; slug?: string }
  if (!created.invitationId) {
    return NextResponse.json(
      { ok: false, message: 'Không nhận được mã thiệp sau khi tạo.' },
      { status: 502, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  const eventLocalStart =
    body.weddingDate && /^\d{8}T\d{6}$/.test(body.weddingDate) ? body.weddingDate : undefined

  const content = {
    schemaVersion: 1 as const,
    displayNames: [body.groomName?.trim() || 'Quốc Bảo', body.brideName?.trim() || 'Minh Anh'],
    eventTitle: body.eventTitle?.trim() || 'Lễ Thành Hôn & Tiệc Mừng',
    ...(body.greeting?.trim() ? { greeting: body.greeting.trim() } : {}),
    ...(eventLocalStart ? { eventLocalStart, timeZone: 'Asia/Ho_Chi_Minh' } : {}),
    templateId: body.templateId ?? 'editorial-vogue',
    ...(body.lunarDate?.trim() ? { lunarDate: body.lunarDate.trim() } : {}),
    ...(body.venueName?.trim() ? { venueName: body.venueName.trim() } : {}),
    ...(body.venueAddress?.trim() ? { venueAddress: body.venueAddress.trim() } : {}),
  }

  await fetch(`${apiOrigin()}/api/v1/invitations/${created.invitationId}/editor`, {
    method: 'PATCH',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ expectedVersion: 0, content }),
    cache: 'no-store',
  })

  return NextResponse.json(
    { ok: true, invitationId: created.invitationId, editorUrl: `/invitations/${created.invitationId}` },
    { status: 201, headers: { 'cache-control': 'private, no-store' } },
  )
}
