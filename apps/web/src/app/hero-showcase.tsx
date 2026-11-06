'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MoriIcon } from '../components/mori-icon'

const BiFoldCardScene = dynamic(
  () => import('../features/preview/bifold-card-scene').then((module) => module.BiFoldCardScene),
  { ssr: false },
)

const MODELS = [
  { slug: 'editorial-bifold-01', label: 'Thanh lịch', color: '#c5a059' },
  { slug: 'traditional-bifold-01', label: 'Á Đông', color: '#7c1f1d' },
  { slug: 'floral-bifold-01', label: 'Thiên nhiên', color: '#607855' },
  { slug: 'minimalist-bifold-01', label: 'Tinh giản', color: '#787367' },
  { slug: 'typography-bifold-01', label: 'Thư pháp', color: '#a67c52' },
] as const

export function HeroShowcase() {
  const [open, setOpen] = useState(0.45)
  const [selectedSlug, setSelectedSlug] = useState<string>(MODELS[0].slug)
  const [showPreview, setShowPreview] = useState(false)
  const [webglUnavailable, setWebglUnavailable] = useState(false)

  return (
    <div className="hero-3d-box">
      <div className="hero-3d-badge">MORI / PHỐI CẢNH MINH HỌA</div>
      {showPreview ? (
        <>
          <div className="hero-model-selector" aria-label="Chọn phong cách minh họa">
            {MODELS.map((model) => (
              <button
                key={model.slug}
                type="button"
                className="hero-model-button"
                aria-pressed={selectedSlug === model.slug}
                onClick={() => setSelectedSlug(model.slug)}
              >
                <span className="hero-model-dot" style={{ backgroundColor: model.color }} />
                {model.label}
              </button>
            ))}
          </div>
          <div className="hero-3d-canvas-wrap">
            {webglUnavailable ? (
              <div className="hero-preview-fallback" role="status">
                <MoriIcon name="paper" />
                <span>Thiết bị này chưa hỗ trợ xem trước 3D.</span>
              </div>
            ) : (
              <BiFoldCardScene
                key={selectedSlug}
                slug={selectedSlug}
                openAmount={open}
                name="Tên hai bạn"
                onUnavailable={() => setWebglUnavailable(true)}
              />
            )}
          </div>
          <div className="hero-3d-controls">
            <label htmlFor="preview-open">Độ mở thiệp</label>
            <input
              id="preview-open"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={open}
              onChange={(event) => setOpen(Number(event.target.value))}
              className="hero-3d-slider"
            />
            <span className="hero-3d-deg">{Math.round(open * 180)}°</span>
            <button type="button" className="hero-preview-close" onClick={() => setShowPreview(false)}>
              Thu gọn
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="hero-preview-stage" aria-hidden="true">
            <div className="hero-preview-envelope" />
            <div className="hero-preview-card">
              <small>TRÂN TRỌNG KÍNH MỜI</small>
              <span className="paper-monogram">M</span>
              <span className="paper-heading">Ngày chung đôi</span>
              <small>MỘT KHỞI ĐẦU MỚI<br />MỘT CÂU CHUYỆN RIÊNG</small>
            </div>
            <div className="paper-reply"><small>MORI WEDDING STUDIO</small><span>Hẹn ngày vui.</span><small>WITH LOVE, ALWAYS</small></div>
          </div>
          <p className="hero-preview-caption">Phối cảnh tham khảo, không thay thế bản duyệt in.</p>
          <button type="button" className="hero-preview-open" onClick={() => setShowPreview(true)}>
            <MoriIcon name="paper" /> Xem trước thiệp 3D
          </button>
        </>
      )}
    </div>
  )
}
