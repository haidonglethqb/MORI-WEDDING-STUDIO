'use client'

import { useState } from 'react'

const HERO_STYLES = [
  {
    slug: 'editorial-bifold-01',
    label: 'Thanh lịch',
    title: "L'Amour Vogue No. 1",
    image: '/images/products/editorial/editorial-bifold-01.jpg',
    color: '#c5a059',
  },
  {
    slug: 'traditional-bifold-01',
    label: 'Á Đông',
    title: 'Song Hỷ Cung Đình',
    image: '/images/products/heritage/traditional-bifold-01.jpg',
    color: '#7c1f1d',
  },
  {
    slug: 'floral-bifold-01',
    label: 'Thiên nhiên',
    title: 'Provence Magnolia',
    image: '/images/products/floral/floral-bifold-01.jpg',
    color: '#607855',
  },
  {
    slug: 'minimalist-bifold-01',
    label: 'Tinh giản',
    title: 'Komorebi Wabi-Sabi',
    image: '/images/products/minimalist/minimalist-bifold-01.jpg',
    color: '#787367',
  },
  {
    slug: 'typography-bifold-01',
    label: 'Thư pháp',
    title: 'Florence Monogram',
    image: '/images/products/modern-calligraphy/typography-bifold-01.jpg',
    color: '#a67c52',
  },
] as const

const BOX_STYLE = {
  background: 'radial-gradient(circle at center, #ffffff 0%, #f4f0e6 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(179, 142, 70, 0.25)',
  padding: '24px',
  textAlign: 'center' as const,
}

const FRAME_STYLE = {
  width: '100%',
  maxWidth: '300px',
  aspectRatio: '3 / 4',
  margin: '18px auto 12px',
  overflow: 'hidden',
  borderRadius: '8px',
  border: '1px solid #d9d1c2',
  background: '#fffdf8',
  boxShadow: '0 14px 32px rgba(48, 43, 34, 0.12)',
}

export function HeroShowcase() {
  const [selectedSlug, setSelectedSlug] = useState<string>(HERO_STYLES[0].slug)
  const activeStyle = HERO_STYLES.find((item) => item.slug === selectedSlug) ?? HERO_STYLES[0]

  return (
    <div className="hero-showcase-box" style={BOX_STYLE}>
      <div style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#75664b', fontWeight: 700, marginBottom: '12px' }}>
        MORI / PHONG CÁCH THIỆP CƯỚI
      </div>
      <div className="hero-model-selector" aria-label="Chọn phong cách thiệp">
        {HERO_STYLES.map((style) => (
          <button
            key={style.slug}
            type="button"
            className="hero-model-button"
            aria-pressed={activeStyle.slug === style.slug}
            onClick={() => setSelectedSlug(style.slug)}
          >
            <span className="hero-model-dot" style={{ backgroundColor: style.color }} />
            {style.label}
          </button>
        ))}
      </div>
      <div style={FRAME_STYLE}>
        <img
          src={activeStyle.image}
          alt={`Mẫu thiệp cưới ${activeStyle.title} phong cách ${activeStyle.label}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif, "Lora", Georgia, serif)', fontSize: '16px', fontWeight: 500, color: '#272d24' }}>
        {activeStyle.title}
      </p>
      <p className="hero-preview-caption">Ảnh mẫu thiết kế 2D trực quan trên giấy mỹ thuật bã mía 350gsm.</p>
      <a href="/collections" className="hero-preview-open" style={{ display: 'inline-flex', width: 'fit-content', textDecoration: 'none' }}>
        Khám phá bộ sưu tập
      </a>
    </div>
  )
}
