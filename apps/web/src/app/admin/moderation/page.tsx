import { cookies } from 'next/headers'
import '../../login/login.css'
import { ModerateInvitation, type ModerationItemView } from './moderate-invitation'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

export default async function AdminModerationPage() {
  const cookie = (await cookies()).toString()
  let response: Response
  try {
    response = await fetch(`${apiOrigin()}/api/v1/admin/moderation`, {
      headers: cookie ? { cookie } : {},
      cache: 'no-store',
    })
  } catch {
    return (
      <main className="login">
        <h1>Kiểm duyệt thiệp</h1>
        <p>Không mở được danh sách kiểm duyệt.</p>
      </main>
    )
  }
  if (response.status === 401) {
    return (
      <main className="login">
        <h1>Kiểm duyệt thiệp</h1>
        <p>
          <a href="/login">Đăng nhập</a> bằng tài khoản quản trị.
        </p>
      </main>
    )
  }
  if (response.status === 404) {
    return (
      <main className="login">
        <h1>Kiểm duyệt thiệp</h1>
        <p>Trang này dành cho quản trị viên.</p>
      </main>
    )
  }
  if (!response.ok) {
    return (
      <main className="login">
        <h1>Kiểm duyệt thiệp</h1>
        <p>Không mở được danh sách kiểm duyệt.</p>
      </main>
    )
  }
  const items = (await response.json()) as ModerationItemView[]
  return (
    <main className="login">
      <h1>Kiểm duyệt thiệp</h1>
      {items.length === 0 ? <p>Chưa có báo cáo cần kiểm duyệt.</p> : null}
      <ul>
        {items.map((item) => (
          <ModerateInvitation key={item.invitationId} item={item} />
        ))}
      </ul>
    </main>
  )
}
