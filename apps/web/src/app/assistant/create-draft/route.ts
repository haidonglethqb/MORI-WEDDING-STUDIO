import type {
  BespokeDesignBlueprint,
  InvitationFamilies,
  InvitationPhotos,
  InvitationScheduleItem,
  InvitationTemplateId,
} from '@mori/contracts'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../lib/safe-mutation-origin'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

interface DraftRequestBody {
  templateId?: InvitationTemplateId
  groomName?: string
  brideName?: string
  displayNames?: [string, string]
  coupleRoles?: [string, string]
  eventTitle?: string
  weddingDate?: string
  eventLocalStart?: string
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  greeting?: string
  families?: InvitationFamilies
  scheduleItems?: InvitationScheduleItem[]
  photos?: InvitationPhotos
  customDesign?: BespokeDesignBlueprint
  publishNow?: boolean
}

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response

  const body = (await request.json().catch(() => ({}))) as DraftRequestBody
  const cookie = (await cookies()).toString()
  const headers = { cookie, origin: originCheck.upstreamOrigin }

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

  const rawDate = body.eventLocalStart ?? body.weddingDate
  const eventLocalStart = rawDate && /^\d{8}T\d{6}$/.test(rawDate) ? rawDate : undefined
  const first = body.displayNames?.[0]?.trim() || body.groomName?.trim() || 'Quốc Bảo'
  const second = body.displayNames?.[1]?.trim() || body.brideName?.trim() || 'Minh Anh'

  const content = {
    schemaVersion: 1 as const,
    displayNames: [first, second] as [string, string],
    eventTitle: body.eventTitle?.trim() || 'Lễ Thành Hôn & Tiệc Mừng',
    ...(body.greeting?.trim() ? { greeting: body.greeting.trim() } : {}),
    ...(eventLocalStart ? { eventLocalStart, timeZone: 'Asia/Ho_Chi_Minh' } : {}),
    templateId: body.templateId ?? (body.customDesign ? 'custom-ai' : 'editorial-vogue'),
    ...(body.coupleRoles ? { coupleRoles: body.coupleRoles } : {}),
    ...(body.families ? { families: body.families } : {}),
    ...(body.lunarDate?.trim() ? { lunarDate: body.lunarDate.trim() } : {}),
    ...(body.venueName?.trim() ? { venueName: body.venueName.trim() } : {}),
    ...(body.venueAddress?.trim() ? { venueAddress: body.venueAddress.trim() } : {}),
    ...(body.scheduleItems?.length ? { scheduleItems: body.scheduleItems } : {}),
    ...(body.photos ? { photos: body.photos } : {}),
    ...(body.customDesign ? { customDesign: body.customDesign } : {}),
  }

  const patchRes = await fetch(`${apiOrigin()}/api/v1/invitations/${created.invitationId}/editor`, {
    method: 'PATCH',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ expectedVersion: 0, content }),
    cache: 'no-store',
  })

  if (!patchRes.ok) {
    return NextResponse.json(
      { ok: false, message: 'Đã tạo thiệp nhưng chưa lưu được nội dung thiết kế.' },
      { status: patchRes.status, headers: { 'cache-control': 'private, no-store' } },
    )
  }

  const patched = (await patchRes.json().catch(() => ({}))) as { version?: number; slug?: string }
  const slug = patched.slug || created.slug || ''
  let published = false

  if (body.publishNow) {
    const pubRes = await fetch(`${apiOrigin()}/api/v1/invitations/${created.invitationId}/publish`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({ expectedVersion: patched.version ?? 1 }),
      cache: 'no-store',
    })
    published = pubRes.ok
  }

  return NextResponse.json(
    {
      ok: true,
      invitationId: created.invitationId,
      slug,
      published,
      editorUrl: `/invitations/${created.invitationId}`,
      ...(published && slug ? { liveUrl: `/i/${slug}` } : {}),
    },
    { status: 201, headers: { 'cache-control': 'private, no-store' } },
  )
}
