'use client'

import { useState } from 'react'
import { ALL_30_MODELS, type DigitalModelProfile } from './invitation-model-profiles'

interface SwitcherProps {
  currentModel: DigitalModelProfile
  onSelect: (model: DigitalModelProfile) => void
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả (30)' },
  { id: 'editorial', label: 'Editorial (5)' },
  { id: 'floral', label: 'Floral (5)' },
  { id: 'traditional', label: 'Heritage Á Đông (5)' },
  { id: 'minimalist', label: 'Minimalist (5)' },
  { id: 'typography', label: 'Typography (5)' },
  { id: 'modern', label: 'Modern (5)' },
]

export function InvitationStyleSwitcher({ currentModel, onSelect }: SwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCat, setSelectedCat] = useState('all')

  const filtered = selectedCat === 'all'
    ? ALL_30_MODELS
    : ALL_30_MODELS.filter((m) => m.style === selectedCat)

  return (
    <aside className="invitation-switcher-wrapper">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="switcher-toggle-floating-btn"
        aria-expanded={isOpen}
      >
        <span className="switcher-sparkle">✦</span>
        <span>Mẫu giao diện: <strong>{currentModel.name}</strong> ({ALL_30_MODELS.length} mẫu)</span>
        <span className="switcher-arrow">{isOpen ? '▼ Đóng' : '▲ Đổi mẫu'}</span>
      </button>

      {isOpen ? (
        <div className="switcher-panel-drawer">
          <div className="switcher-panel-header">
            <div>
              <h4 className="switcher-title">Thư viện 30 Phong cách Thiệp số MORI Atelier</h4>
              <p className="switcher-desc">Chạm vào bất kỳ mẫu nào để trải nghiệm giao diện thiệp số trực tiếp.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="switcher-close-btn"
            >
              ✕
            </button>
          </div>

          <div className="switcher-cats-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`switcher-cat-pill ${selectedCat === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="switcher-models-scroll">
            {filtered.map((item) => {
              const isCurrent = item.slug === currentModel.slug
              return (
                <button
                  key={item.slug}
                  type="button"
                  className={`model-option-card ${isCurrent ? 'selected' : ''}`}
                  onClick={() => {
                    onSelect(item)
                    setIsOpen(false)
                  }}
                  style={{ borderLeftColor: item.accentColor }}
                >
                  <div className="model-swatch" style={{ background: item.cardBg, borderColor: item.borderColor }}>
                    <span style={{ color: item.accentColor }}>✦</span>
                  </div>
                  <div className="model-text-info">
                    <span className="model-badge-tag">{item.badge}</span>
                    <strong className="model-title">{item.name}</strong>
                    <small className="model-sub">Dáng {item.silhouette} · {item.style}</small>
                  </div>
                  {isCurrent ? <span className="model-check-icon">✓</span> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
