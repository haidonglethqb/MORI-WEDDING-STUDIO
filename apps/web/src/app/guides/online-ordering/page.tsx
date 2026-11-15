import type { Metadata } from 'next'
import Link from 'next/link'
import { HomeNav } from '../../home-nav'
import { HomeFooter } from '../../home-footer'
import { GuideNavStrip } from '../guide-nav-strip'
import { ONLINE_ORDERING_INTRO, ONLINE_ORDERING_STEPS } from './online-ordering-data'
import { OrderingStepMockup } from './ordering-step-mockup'
import '../guides-shared.css'
import './online-ordering.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hướng dẫn đặt thiệp cưới trên website MORI · MORI Wedding Studio',
  description:
    'Hướng dẫn chi tiết 8 bước đặt thiệp cưới online, chọn combo giảm 50%, thanh toán và duyệt bản 2D trên website MORI.',
}

export default function OnlineOrderingGuidePage() {
  return (
    <div className="mori-guide-shell">
      <HomeNav />
      <main className="mori-guide-main">
        <GuideNavStrip active="online-ordering" />

        <section className="guide-hero-band">
          <span className="guide-hero-kicker">HƯỚNG DẪN ĐẶT HÀNG TRỰC TUYẾN</span>
          <h1>HƯỚNG DẪN ĐẶT THIỆP CƯỚI TRÊN WEBSITE MORI</h1>
          <p className="guide-hero-lead">{ONLINE_ORDERING_INTRO}</p>
        </section>

        <section className="online-steps-stack" aria-label="8 bước đặt hàng online tại MORI">
          {ONLINE_ORDERING_STEPS.map((step) => (
            <article key={step.code} className="online-step-row">
              <div className="online-step-info">
                <div className="online-step-head">
                  <span className="online-step-num" aria-hidden="true">
                    {step.number}
                  </span>
                  <div>
                    <span className="online-step-kicker">{step.code}</span>
                    <h2>{step.title}</h2>
                  </div>
                </div>

                <div className="online-step-copy">
                  {step.paragraphs.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>

                <span className="online-step-hint">→ {step.actionTargetLabel}</span>
              </div>

              <OrderingStepMockup kind={step.mockupKind} />
            </article>
          ))}
        </section>

        <section className="guide-cta-banner">
          <h2>Bắt đầu đặt thiệp ngay trên website MORI</h2>
          <p>
            Bạn có thể chọn mẫu thiệp có sẵn trong Bộ sưu tập, chọn font chữ trước ở Bảng font chữ hoặc tra cứu đơn hàng đã đặt.
          </p>
          <div className="guide-cta-actions">
            <Link href="/collections" className="guide-btn-primary">
              Xem bộ sưu tập
            </Link>
            <Link href="/order-tracking" className="guide-btn-secondary">
              Kiểm tra đơn hàng
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}
