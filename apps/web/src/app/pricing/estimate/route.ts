import { EstimateRequestSchema } from '@mori/contracts'
import { NextResponse } from 'next/server'
import { validateBffOrigin } from '../../../lib/safe-mutation-origin'

export async function POST(request: Request) {
  const originCheck = validateBffOrigin(request)
  if (!originCheck.ok) return originCheck.response
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ message: 'Dữ liệu không hợp lệ.' }, { status: 400 }) }
  const parsed = EstimateRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Vui lòng kiểm tra mẫu và số lượng.' }, { status: 400 })
  try {
    const origin = process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
    const upstream = await fetch(`${origin}/api/v1/pricing/estimate`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed.data), cache: 'no-store',
    })
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
  } catch { return NextResponse.json({ message: 'Không thể kết nối máy chủ.' }, { status: 503 }) }
}
