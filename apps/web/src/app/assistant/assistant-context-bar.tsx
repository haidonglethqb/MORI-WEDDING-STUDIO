'use client'

import { MoriIcon } from '../../components/mori-icon'
import type { ConversationWeddingBrief } from './assistant-types'

interface ContextBarProps {
  brief: ConversationWeddingBrief
}

const VENUE_LABELS: Record<string, string> = {
  OUTDOOR_GARDEN: 'Sân vườn',
  HOTEL_BALLROOM: 'Khách sạn Ballroom',
  BEACH_RESORT: 'Bãi biển Resort',
  HERITAGE_HOME: 'Tư gia Á Đông',
  CHURCH: 'Nhà thờ',
}

const STYLE_LABELS: Record<string, string> = {
  EDITORIAL_VOGUE: 'Vogue Paris',
  HERITAGE_INDOCHINE: 'Heritage Á Đông',
  FLORAL_BOTANICAL: 'Floral Botanical',
  MINIMALIST_JAPANDI: 'Wabi-Sabi',
  MODERN_CALLIGRAPHY: 'Thư pháp',
}

export function AssistantContextBar({ brief }: ContextBarProps) {
  const validGuestCount = typeof brief.guestCount === 'number' && brief.guestCount > 0 ? brief.guestCount : null
  const validSuites = typeof brief.estimatedSuites === 'number' && brief.estimatedSuites > 0 ? brief.estimatedSuites : null

  const slots = [
    Boolean(brief.coupleNames),
    Boolean(brief.aestheticIdentity),
    Boolean(brief.location || brief.venueCategory),
    validGuestCount !== null || validSuites !== null,
    Boolean(brief.weddingDate || brief.budgetRangeVnd),
  ]
  const filledCount = slots.filter(Boolean).length
  const pct = Math.round((filledCount / slots.length) * 100)
  const visualPct = filledCount === 0 ? 10 : pct

  const tags: Array<{ id: string; text: string; icon?: 'palette' | 'map-pin' | 'calendar' }> = []
  if (brief.coupleNames) tags.push({ id: 'couple', text: brief.coupleNames })
  if (brief.aestheticIdentity) {
    tags.push({
      id: 'style',
      text: STYLE_LABELS[brief.aestheticIdentity] ?? brief.aestheticIdentity,
      icon: 'palette',
    })
  }
  if (brief.location || brief.venueCategory) {
    const place = [brief.location, brief.venueCategory ? VENUE_LABELS[brief.venueCategory] : null]
      .filter(Boolean)
      .join(' · ')
    tags.push({ id: 'place', text: place, icon: 'map-pin' })
  }
  if (validGuestCount !== null || validSuites !== null) {
    const qtyLabel = validGuestCount
      ? `${validGuestCount} khách (~${validSuites ?? Math.round(validGuestCount * 0.65)} bộ)`
      : `${validSuites} bộ thiệp`
    tags.push({ id: 'qty', text: qtyLabel })
  }
  if (brief.weddingDate) {
    tags.push({ id: 'date', text: brief.weddingDate, icon: 'calendar' })
  }

  return (
    <div className="energy-context-bar" aria-label="Độ hoàn thiện hồ sơ tiệc cưới">
      <div className="energy-context-inner">
        <div className="energy-top-row">
          <div className="energy-label-group">
            <span className={`energy-pulse-dot ${filledCount === 5 ? 'is-full' : ''}`} aria-hidden="true" />
            <span className="energy-title">
              {filledCount === 5
                ? 'Hồ sơ tiệc cưới đã đầy năng lượng'
                : 'Năng lượng hồ sơ tiệc cưới'}
            </span>
          </div>
          <span className="energy-score-badge">
            {pct}% · {filledCount}/5 yếu tố
          </span>
        </div>

        <div
          className="energy-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`energy-fill ${filledCount > 0 ? 'is-charged' : ''} ${filledCount === 5 ? 'is-max' : ''}`}
            style={{ width: `${visualPct}%` }}
          />
        </div>

        {tags.length > 0 ? (
          <div className="energy-chips-row">
            {tags.map((tag) => (
              <span key={tag.id} className="energy-chip">
                {tag.icon ? <MoriIcon name={tag.icon} width={12} height={12} /> : <span className="energy-chip-star">✦</span>}
                <span>{tag.text}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
