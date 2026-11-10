'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { landingPhotos } from './landing-photos'

export function PortalHero() {
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = section.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const range = el.offsetHeight - innerHeight
      const progress = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(range, 1)))
      el.style.setProperty('--portal-progress', String(progress))
      // Hero links become interactive only once they are visibly revealed.
      el.classList.toggle('portal-open', progress > 0.7)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    el.classList.add('portal-motion')
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])
  const { hero } = landingPhotos
  return (
    <section className="portal" ref={section} aria-labelledby="portal-title">
      <div className="portal-stage">
        <div className="portal-art">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" />
        </div>
        <div className="portal-veil" aria-hidden="true" />
        <div className="portal-panel portal-panel-left" aria-hidden="true" /><div className="portal-panel portal-panel-right" aria-hidden="true" />
        <span className="portal-dot portal-dot-one" aria-hidden="true" /><span className="portal-dot portal-dot-two" aria-hidden="true" />
        <div className="portal-meta portal-meta-top"><span>WEDDING STUDIO / VIỆT NAM</span><span>THIỆP GIẤY · THIỆP SỐ</span></div>
        <h1 id="portal-title" className="portal-wordmark" aria-label="MORI"><span>MO</span><span>RI</span></h1>
        <div className="portal-hero-copy">
          <p className="portal-hero-statement">Một lời mời, <em>trọn câu chuyện của hai bạn.</em></p>
          <p className="portal-hero-lead">Thiệp giấy và thiệp số được thiết kế cùng xưởng MORI — từ bản phác đầu tiên đến ngày gửi trao.</p>
          <div className="portal-actions">
            <a className="portal-button portal-button-solid" href="/collections">Khám phá bộ sưu tập ↗</a>
            <a className="portal-link" href="/workspace">Bắt đầu thiệp số →</a>
          </div>
        </div>
        <div className="portal-meta portal-meta-bottom"><span>MỘT LỜI MỜI, MỘT CÂU CHUYỆN</span><span>CUỘN ĐỂ KHÁM PHÁ ↓</span></div>
        <p className="portal-art-label">ẢNH MINH HỌA</p>
      </div>
    </section>
  )
}
