'use client'

import { useEffect, useRef } from 'react'

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
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    el.classList.add('portal-motion')
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])
  return (
    <section className="portal" ref={section} aria-labelledby="portal-title">
      <div className="portal-stage">
        <div className="portal-art" aria-hidden="true"><div className="portal-envelope" /><div className="portal-paper"><small>TRÂN TRỌNG KÍNH MỜI</small><span>M</span><p>Một lời mời<br />rất riêng.</p><small>MORI · WEDDING STUDIO</small></div></div>
        <div className="portal-veil" aria-hidden="true" />
        <div className="portal-panel portal-panel-left" aria-hidden="true" /><div className="portal-panel portal-panel-right" aria-hidden="true" />
        <span className="portal-dot portal-dot-one" aria-hidden="true" /><span className="portal-dot portal-dot-two" aria-hidden="true" />
        <div className="portal-meta portal-meta-top"><span>WEDDING STUDIO / VIỆT NAM</span><span>THIỆP GIẤY · THIỆP SỐ</span></div>
        <h1 id="portal-title" className="portal-wordmark" aria-label="MORI"><span>MO</span><span>RI</span></h1>
        <div className="portal-meta portal-meta-bottom"><span>MỘT LỜI MỜI, MỘT CÂU CHUYỆN</span><span>CUỘN ĐỂ KHÁM PHÁ ↓</span></div>
        <p className="portal-art-label">PHỐI CẢNH MINH HỌA</p>
      </div>
    </section>
  )
}
