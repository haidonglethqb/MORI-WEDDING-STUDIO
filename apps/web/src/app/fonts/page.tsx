import type { Metadata } from 'next'
import Link from 'next/link'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { GuideNavStrip } from '../guides/guide-nav-strip'
import { FONTS_PAGE_INTRO } from './fonts-data'
import { FontsGallery } from './fonts-gallery'
import '../guides/guides-shared.css'
import './fonts-gallery.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bảng font chữ thiệp cưới MORI · MORI Wedding Studio',
  description:
    'Xem thử 16 mẫu font chữ tiếng Việt chia 4 phong cách và lưu mã font MORI F01–F16 cho thiệp cưới của bạn.',
}

export default function FontsPage() {
  return (
    <div className="mori-guide-shell">
      <HomeNav />
      <main className="mori-guide-main">
        <GuideNavStrip active="fonts" />

        <section className="guide-hero-band">
          <span className="guide-hero-kicker">BỘ SƯU TẬP CHỮ IN · MORI F01 – F16</span>
          <h1>BẢNG FONT CHỮ THIỆP CƯỚI MORI</h1>
          <p className="guide-hero-lead">{FONTS_PAGE_INTRO}</p>
        </section>

        <FontsGallery />

        <section className="guide-cta-banner" aria-label="Tiếp tục thiết kế thiệp cùng MORI">
          <h2>Đã tìm được kiểu chữ ưng ý?</h2>
          <p>
            Bạn có thể chọn mẫu thiệp trong bộ sưu tập hoặc gửi mã font kèm ý tưởng thiết kế riêng
            cho đội ngũ MORI.
          </p>
          <div className="guide-cta-actions">
            <Link href="/collections?tab=custom" className="guide-btn-primary">
              Đặt thiết kế riêng với font đã chọn
            </Link>
            <Link href="/collections" className="guide-btn-secondary">
              Xem bộ sưu tập thiệp MORI
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}
