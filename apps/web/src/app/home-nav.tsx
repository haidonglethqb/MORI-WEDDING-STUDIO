import Link from 'next/link'
import { cookies } from 'next/headers'
import './home-nav.css'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

interface CurrentUser {
  id: string
  email: string
  displayName: string
  role: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.toString()
  if (!cookie) return null

  try {
    const response = await fetch(`${apiOrigin()}/api/v1/me`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as CurrentUser
  } catch {
    return null
  }
}

export async function HomeNav() {
  const user = await fetchCurrentUser()

  return (
    <header className="home-nav">
      <Link className="home-mark" href="/">
        MORI
      </Link>
      <nav aria-label="Chính" className="home-nav-links">
        <Link href="/collections">Bộ sưu tập</Link>
        <Link href="/assistant">Trợ lý gợi ý</Link>
        <Link href="/#thiep-so">Thiệp số</Link>
        <Link href="/#xuong">Xưởng</Link>
      </nav>
      <div className="home-nav-end">
        {user ? (
          <>
            {user.role === 'STUDIO' || user.role === 'ADMIN' ? (
              <Link className="nav-link-staff" href="/studio">
                Hàng đợi xưởng
              </Link>
            ) : null}
            {user.role === 'ADMIN' ? (
              <Link className="nav-link-staff" href="/admin/ai">
                Cấu hình AI
              </Link>
            ) : null}
            <Link className="nav-link-item" href="/workspace">
              Việc của tôi
            </Link>
            <div className="nav-user-badge">
              <span className="user-role-tag">{user.role}</span>
              <span className="user-name">{user.displayName}</span>
            </div>
            <a className="nav-logout-btn" href="/logout">
              Đăng xuất
            </a>
          </>
        ) : (
          <>
            <Link className="nav-link-login" href="/login">
              Đăng nhập
            </Link>
            <Link className="home-cta" href="/collections">
              Xem bộ sưu tập
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
