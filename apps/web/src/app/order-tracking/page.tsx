import type { Metadata } from 'next'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { GuideNavStrip } from '../guides/guide-nav-strip'
import { OrderTrackingClient } from './order-tracking-client'
import '../guides/guides-shared.css'
import './order-tracking.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng của bạn · MORI Wedding Studio',
  description:
    'Nhập mã đơn hàng và số điện thoại hoặc email để theo dõi tiến độ thiệp giấy, thiệp online và đơn combo tại MORI.',
}

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; contact?: string }>
}) {
  const params = await searchParams
  const initialCode = typeof params.code === 'string' ? params.code : ''
  const initialContact = typeof params.contact === 'string' ? params.contact : ''

  return (
    <div className="mori-guide-shell">
      <HomeNav />
      <main className="mori-guide-main">
        <GuideNavStrip active="order-tracking" />

        <section className="guide-hero-band">
          <span className="guide-hero-kicker">THEO DÕI TIẾN ĐỘ · MORI</span>
          <h1>TRA CỨU ĐƠN HÀNG CỦA BẠN</h1>
          <p className="guide-hero-lead">
            “Bạn đang mong chờ những tấm thiệp cưới của mình? Hãy nhập thông tin đơn hàng bên dưới để
            cùng MORI theo dõi tiến độ nhé!”
          </p>
        </section>

        <OrderTrackingClient initialCode={initialCode} initialContact={initialContact} />
      </main>
      <HomeFooter />
    </div>
  )
}
