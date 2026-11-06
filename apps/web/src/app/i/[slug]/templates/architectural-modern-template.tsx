'use client'

import type { DigitalModelProfile } from '../invitation-model-profiles'
import { InvitationAudioPlayer } from '../invitation-audio-player'

interface TemplateProps {
  profile: DigitalModelProfile
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
  partyName?: string | null | undefined
  venue: string
}

export function ArchitecturalModernTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-modern-arch"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="modern-dual-arch-frame" style={{ borderColor: profile.borderColor }} />

      {/* Celestial Moon Halo Header */}
      <div className="modern-celestial-header">
        <span className="celestial-halo-symbol" style={{ color: profile.accentColor }}>
          ☽ ✦ ☾
        </span>
        <span className="modern-atelier-code">NORDIC ARCHITECTURE · SIGNATURE EDITION</span>
      </div>

      {partyName ? (
        <div className="modern-guest-tag" style={{ borderColor: profile.accentColor }}>
          <span>Trân trọng kính mời:</span>
          <strong>{partyName}</strong>
        </div>
      ) : null}

      {/* Modern Headline */}
      <div className="modern-headline-block">
        <span className="modern-prehead" style={{ color: profile.accentColor }}>
          THE UNION OF TWO SOULS
        </span>
        <h1 className="modern-names-title">
          <span>{displayNames[0]}</span>
          <span className="modern-arch-slash" style={{ color: profile.accentColor }}>/</span>
          <span>{displayNames[1]}</span>
        </h1>
        <p className="modern-event-desc">{eventTitle}</p>
      </div>

      {/* Parents Clean Modern Block */}
      <div className="modern-parents-grid">
        <div className="modern-family-cell">
          <small style={{ color: profile.accentColor }}>NHÀ TRAI</small>
          <strong>Chu Đức Long</strong>
          <strong>Nguyễn Thị Mai</strong>
        </div>
        <div className="modern-grid-sep" style={{ background: profile.borderColor }} />
        <div className="modern-family-cell">
          <small style={{ color: profile.accentColor }}>NHÀ GÁI</small>
          <strong>Trần Hải Nam</strong>
          <strong>Lê Kim Phượng</strong>
        </div>
      </div>

      {/* Architectural Schedule Card */}
      <div className="modern-schedule-block" style={{ borderColor: profile.borderColor }}>
        <div className="modern-date-badge" style={{ color: profile.accentColor }}>
          SUNDAY · 28.11.2026
        </div>
        <p className="modern-lunar-line">(20 Tháng 10 Năm Bính Ngọ)</p>

        <div className="modern-timeline-strip">
          <div className="m-step">
            <span className="m-time">10:30</span>
            <span className="m-label">ĐÓN KHÁCH</span>
          </div>
          <span className="m-divider">——</span>
          <div className="m-step">
            <span className="m-time">11:30</span>
            <span className="m-label">THÀNH HÔN</span>
          </div>
          <span className="m-divider">——</span>
          <div className="m-step">
            <span className="m-time">12:00</span>
            <span className="m-label">TIỆC RƯỢU</span>
          </div>
        </div>

        <div className="modern-venue-info">
          <strong>Grand Ballroom · InterContinental Landmark72</strong>
          <address>{venue}</address>
        </div>
      </div>

      {/* Quote */}
      <div className="modern-quote-box">
        <p>
          &ldquo;{greeting || 'Khoảnh khắc trọn vẹn nhất trong đời khi có bạn kề bên chia sẻ những nụ cười và lời chúc phúc.'}&rdquo;
        </p>
      </div>

      {/* Countdown Strip */}
      <div className="modern-countdown-line" style={{ borderColor: profile.borderColor }}>
        <div className="m-count-col"><strong>42</strong><small>DAYS</small></div>
        <span>:</span>
        <div className="m-count-col"><strong>14</strong><small>HOURS</small></div>
        <span>:</span>
        <div className="m-count-col"><strong>28</strong><small>MINUTES</small></div>
      </div>

      <InvitationAudioPlayer />

      <div className="modern-card-footer" style={{ color: profile.accentColor }}>
        <span>✦ MORI ARCHITECTURAL ATELIER · BESPOKE WEDDING ✦</span>
      </div>
    </article>
  )
}
