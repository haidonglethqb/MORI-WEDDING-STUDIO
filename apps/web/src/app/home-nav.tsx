import Link from 'next/link'
import './home-nav.css'

export function HomeNav() {
  return (
    <header className="home-nav">
      <Link className="home-mark" href="/">
        MORI
      </Link>
      <nav aria-label="Chính">
        <Link href="/collections">Bộ sưu tập</Link>
        <Link href="/assistant">Gợi ý</Link>
        <Link href="#thiep-so">Thiệp số</Link>
        <Link href="#xuong">Xưởng</Link>
      </nav>
      <div className="home-nav-end">
        <Link href="/workspace">Việc của tôi</Link>
        <Link href="/studio">Hàng đợi</Link>
        <Link href="/login">Tài khoản</Link>
        <Link className="home-cta" href="/collections">
          Xem bộ sưu tập
        </Link>
      </div>
    </header>
  )
}
