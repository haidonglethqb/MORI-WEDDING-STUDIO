'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const BiFoldCardScene = dynamic(
  () => import('../features/preview/bifold-card-scene').then((m) => m.BiFoldCardScene),
  { ssr: false },
)

export function HeroShowcase() {
  const [open, setOpen] = useState(0.45)

  return (
    <div className="hero-3d-box">
      <div className="hero-3d-badge">
        <span>✦ 3D ATELIER SHOWCASE ✦</span>
      </div>
      <div className="hero-3d-canvas-wrap">
        <BiFoldCardScene
          openAmount={open}
          name="Minh Sơn &amp; Thảo Vy"
          style="editorial"
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
