import { cookies } from 'next/headers'
import '../login/login.css'

export const dynamic = 'force-dynamic'

interface StudioQueueItem {
  requestId: string
  kind: string
  status: string
  internalTitle: string
}

const kindLabel: Record<string, string> = {
  PAPER: 'Thiệp giấy',
  DIGITAL: 'Thiệp số',
  BUNDLE: 'Giấy và số',
}

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function StudioPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/studio/requests`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Hàng đợi xưởng</h1>
        <p>Không mở được hàng đợi.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Hàng đợi xưởng</h1>
        <p>
          <a href="/login">Đăng nhập</a> bằng tài khoản xưởng.
        </p>
      </main>
    )
  }
  if (response.status === 404) {
    return (
      <main className="login">
        <h1>Hàng đợi xưởng</h1>
        <p>Trang này dành cho tài khoản xưởng.</p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Hàng đợi xưởng</h1>
        <p>Không mở được hàng đợi.</p>
      </main>
    )
  }
  const items = (await response.json()) as StudioQueueItem[]
  return (
    <main className="login">
      <h1>Hàng đợi xưởng</h1>
      <p>
        <a href="/studio/orders">Đơn đang làm</a>
      </p>
      {items.length === 0 ? <p>Chưa có việc được giao.</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item.requestId}>
            <a href={`/studio/requests/${item.requestId}`}>
              {item.internalTitle} · {kindLabel[item.kind] ?? item.kind} · {item.status}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
