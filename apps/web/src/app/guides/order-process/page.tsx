import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { HomeNav } from '../../home-nav'
import { HomeFooter } from '../../home-footer'
import { GuideNavStrip } from '../guide-nav-strip'
import { ORDER_PROCESS_INTRO, ORDER_PROCESS_STEPS } from './order-process-data'
import '../guides-shared.css'
import './order-process.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Quy trình đặt và nhận thiệp tại MORI · MORI Wedding Studio',
  description:
    'Tìm hiểu 8 bước đặt thiệp cưới giấy bã mía, thiệp online và combo thiệp tại MORI Wedding Studio.',
}

export default function OrderProcessGuidePage() {
  return (
    <div className="mori-guide-shell">
      <HomeNav />
      <main className="mori-guide-main">
        <GuideNavStrip active="order-process" />

        <section className="guide-hero-band">
          <span className="guide-hero-kicker">HƯỚNG DẪN VÀ HỖ TRỢ · MORI</span>
          <h1>QUY TRÌNH ĐẶT VÀ NHẬN THIỆP TẠI MORI</h1>
          <p className="guide-hero-lead">{ORDER_PROCESS_INTRO}</p>
        </section>

        <section className="process-steps-list" aria-label="8 bước đặt và nhận thiệp">
          {ORDER_PROCESS_STEPS.map((step, idx) => (
            <article
              key={step.code}
              className={`process-step-card ${idx % 2 === 1 ? 'is-reversed' : ''}`}
            >
              <div className="process-step-content">
                <div className="process-step-top">
                  <span className="process-step-num" aria-hidden="true">
                    {step.number}
                  </span>
                  <div>
                    <span className="process-step-code">{step.code}</span>
                    <h2 className="process-step-title">{step.title}</h2>
                  </div>
                </div>

                <div className="process-step-paragraphs">
                  {step.paragraphs.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>

                {step.bullets && step.bullets.length > 0 ? (
                  <ul className="process-step-bullets">
                    {step.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <figure className="process-step-media">
                <div className="process-step-photo-frame">
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    fill
                    unoptimized
                    sizes="(max-width: 860px) 100vw, 440px"
                    className="process-step-photo"
                  />
                </div>
                <figcaption className="process-step-caption">{step.imageCaption}</figcaption>
              </figure>
            </article>
          ))}
        </section>

        <section className="guide-cta-banner">
          <h2>Sẵn sàng chọn mẫu thiệp cho ngày cưới của hai bạn?</h2>
          <p>
            Khám phá ngay bộ sưu tập thiệp giấy bã mía, thiệp cưới online và combo ưu đãi 50% tại MORI.
          </p>
          <div className="guide-cta-actions">
            <Link href="/collections" className="guide-btn-secondary">
              Xem bộ sưu tập
            </Link>
            <Link href="/collections" className="guide-btn-primary">
              Đặt thiệp ngay
            </Link>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}
