'use client'

import type { ConversationWeddingBrief } from './assistant-types'
import { MoriIcon } from '../../components/mori-icon'

interface ContextBarProps {
  brief: ConversationWeddingBrief
  onReset: () => void
}

const VENUE_LABELS: Record<string, string> = {
  OUTDOOR_GARDEN: 'Sân vườn ngoài trời',
  HOTEL_BALLROOM: 'Khách sạn Ballroom',
  BEACH_RESORT: 'Bãi biển Resort',
  HERITAGE_HOME: 'Tư gia Á Đông',
  CHURCH: 'Nhà thờ Thánh đường',
}

const STYLE_LABELS: Record<string, string> = {
  EDITORIAL_VOGUE: 'Vogue Paris',
  HERITAGE_INDOCHINE: 'Heritage Á Đông',
  FLORAL_BOTANICAL: 'Floral Botanical',
  MINIMALIST_JAPANDI: 'Wabi-Sabi Japandi',
  MODERN_CALLIGRAPHY: 'Modern Calligraphy',
}

export function AssistantContextBar({ brief, onReset }: ContextBarProps) {
  const hasData =
    Boolean(brief.coupleNames) ||
    Boolean(brief.location) ||
    Boolean(brief.venueCategory) ||
    Boolean(brief.guestCount) ||
    Boolean(brief.aestheticIdentity)

  return (
    <div className="assistant-context-bar">
      <div className="assistant-context-info">
        <span className="context-indicator-dot" />
        <span className="context-label">BỘ NHỚ NGỮ CẢNH ATELIER:</span>
        {hasData ? (
          <div className="context-tags">
            {brief.coupleNames && (
              <span className="context-tag">✦ {brief.coupleNames}</span>
            )}
            {brief.location && <span className="context-tag">📍 {brief.location}</span>}
            {brief.venueCategory && (
              <span className="context-tag">
                🏛 {VENUE_LABELS[brief.venueCategory] ?? brief.venueCategory}
              </span>
            )}
            {brief.guestCount && (
              <span className="context-tag">
                👥 {brief.guestCount} khách ({brief.estimatedSuites ?? Math.round(brief.guestCount * 0.65)} bộ)
              </span>
            )}
            {brief.aestheticIdentity && (
              <span className="context-tag">
                <MoriIcon name="palette" /> {STYLE_LABELS[brief.aestheticIdentity] ?? brief.aestheticIdentity}
              </span>
            )}
          </div>
        ) : (
          <span className="context-empty-hint">
            Chưa có thông tin — Hãy chia sẻ tên cặp đôi, ngày cưới hoặc địa điểm tổ chức để nghệ nhân ghi nhớ.
          </span>
        )}
      </div>
      <button
        type="button"
        className="context-reset-btn"
        title="Làm mới cuộc trò chuyện và ngữ cảnh"
        onClick={onReset}
      >
        ↺ Bắt đầu lại
      </button>
    </div>
  )
}
