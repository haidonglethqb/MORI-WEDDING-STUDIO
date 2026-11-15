import type { Metadata } from 'next'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { GuideNavStrip } from '../guides/guide-nav-strip'
import { FAQ_INTRO } from './faq-data-part1'
import { FaqClient } from './faq-client'
import '../guides/guides-shared.css'
import './faq.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp · MORI Wedding Studio',
  description:
    'Giải đáp 28 câu hỏi phổ biến về chất liệu giấy bã mía, thiết kế cá nhân hóa, thiệp online, combo giảm 50% và giao hàng tại MORI.',
}

export default function FaqPage() {
  return (
    <div className="mori-guide-shell">
      <HomeNav />
      <main className="mori-guide-main">
        <GuideNavStrip active="faq" />

        <section className="guide-hero-band">
          <span className="guide-hero-kicker">GIẢI ĐÁP THẮC MẮC · MORI</span>
          <h1>CÂU HỎI THƯỜNG GẶP</h1>
          <p className="guide-hero-lead">{FAQ_INTRO}</p>
        </section>

        <FaqClient />
      </main>
      <HomeFooter />
    </div>
  )
}
