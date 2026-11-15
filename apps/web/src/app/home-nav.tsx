import Link from 'next/link'
import { cookies } from 'next/headers'
import { CartNavButton } from '../features/cart/cart-nav-button'
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
  const isStaff = user?.role === 'STUDIO' || user?.role === 'ADMIN'
  const assistantHref = isStaff ? '/admin/ai' : '/assistant'

  return (
    <header className="home-nav">
      <div className="home-promo-bar">
        <div className="home-promo-inner">
          <span>Ưu đãi 50% thiệp online khi đặt cùng thiệp cưới giấy tại MORI</span>
          <Link className="home-promo-cta" href="/collections">
            ĐẶT NGAY
          </Link>
        </div>
      </div>
      <div className="home-nav-inner">
        <Link className="home-mark" href="/" aria-label="MORI Wedding Studio - Trang chủ">
          <span className="home-mark-word">mori</span>
          <span className="home-mark-sub">WEDDING STUDIO</span>
        </Link>
        <nav aria-label="Chính" className="home-nav-links">
          <Link href="/">TRANG CHỦ</Link>
          <Link href="/collections">BỘ SƯU TẬP</Link>
          <Link href="/blog">BLOG CƯỚI</Link>
          <Link href="/collections?tab=online">THIỆP ONLINE</Link>
          <Link href={assistantHref}>TRỢ LÝ AI</Link>
        </nav>
        <div className="home-nav-end">
          <CartNavButton />
          {user ? (
            <>
              {isStaff ? (
                <>
                  <Link className="nav-link-staff" href="/studio">
                    Hàng đợi xưởng
                  </Link>
                  <Link className="nav-link-staff" href="/admin/ai">
                    Quản trị Chatbot
                  </Link>
                </>
              ) : null}
              <div className="nav-user-badge" title={user.displayName}>
                {isStaff ? <span className="user-role-tag">{user.role}</span> : null}
                <span className="user-name">{user.displayName}</span>
              </div>
              <a className="nav-logout-btn" href="/logout">
                ĐĂNG XUẤT
              </a>
            </>
          ) : (
            <>
              <Link className="nav-link-login" href="/login">
                ĐĂNG NHẬP
              </Link>
              <Link className="home-cta" href="/collections">
                ĐẶT NGAY
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
