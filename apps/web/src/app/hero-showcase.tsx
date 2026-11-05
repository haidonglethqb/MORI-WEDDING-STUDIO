'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const BiFoldCardScene = dynamic(
  () => import('../features/preview/bifold-card-scene').then((m) => m.BiFoldCardScene),
  { ssr: false },
)

const SHOWCASE_MODELS = [
  { slug: 'editorial-bifold-01', label: 'Vogue Paris', dot: '#c5a059' },
  { slug: 'traditional-bifold-01', label: 'Song Hỷ Á Đông', dot: '#7c1f1d' },
  { slug: 'floral-bifold-01', label: 'Provence Floral', dot: '#607855' },
  { slug: 'minimalist-bifold-01', label: 'Kyoto Wabi-Sabi', dot: '#787367' },
  { slug: 'typography-bifold-01', label: 'Florence Script', dot: '#a67c52' },
] as const

export function HeroShowcase() {
  const [open, setOpen] = useState(0.45)
  const [selectedSlug, setSelectedSlug] = useState<string>('editorial-bifold-01')

  return (
    <div className="hero-3d-box">
      <div className="hero-3d-badge">
        <span>✦ 3D ATELIER SHOWCASE ✦</span>
      </div>

      {/* Model Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        {SHOWCASE_MODELS.map((item) => {
          const isActive = selectedSlug === item.slug
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSelectedSlug(item.slug)}
              style={{
                border: isActive ? '1px solid #3e4a39' : '1px solid rgba(85, 99, 79, 0.18)',
                background: isActive ? '#3e4a39' : '#ffffff',
                color: isActive ? '#f7f5ed' : '#495244',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: item.dot,
                  display: 'inline-block',
                }}
              />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="hero-3d-canvas-wrap">
        <BiFoldCardScene
          key={selectedSlug}
          slug={selectedSlug}
          openAmount={open}
          name="Minh Sơn & Thảo Vy"
          onUnavailable={() => {}}
        />
      </div>

      <div className="hero-3d-controls">
        <span className="hero-3d-hint">✥ Kéo chuột xoay 360° · Trượt mở thiệp:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={open}
          onChange={(e) => setOpen(Number(e.target.value))}
          className="hero-3d-slider"
          aria-label="Độ mở thiệp"
        />
        <span className="hero-3d-deg">{Math.round(open * 180)}°</span>
      </div>
    </div>
  )
}
