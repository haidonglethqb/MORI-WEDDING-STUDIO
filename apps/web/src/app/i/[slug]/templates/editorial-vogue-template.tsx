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

export function EditorialVogueTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-editorial-vogue"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="vogue-arch-frame" style={{ borderColor: profile.borderColor }} />

      {/* Top Parisian Monogram Header */}
      <div className="vogue-header-strip">
        <span className="vogue-edition-tag">PARIS ATELIER · ÉDITION SPÉCIALE</span>
        <div className="vogue-roman-date" style={{ color: profile.accentColor }}>
          XII · XII · MMXXVI
        </div>
      </div>

      {partyName ? (
        <div className="vogue-guest-pill" style={{ borderColor: profile.accentColor }}>
          <span>Trân trọng kính mời:</span>
          <strong>{partyName}</strong>
        </div>
      ) : null}

      {/* Vogue Title Hierarchy */}
      <div className="vogue-hero-title">
        <span className="vogue-pre-title" style={{ color: profile.accentColor }}>
          THE WEDDING CELEBRATION OF
        </span>
        <h1 className="vogue-names">
          <span className="vogue-first-name">{displayNames[0]}</span>
          <span className="vogue-ampersand" style={{ color: profile.accentColor }}>&amp;</span>
          <span className="vogue-second-name">{displayNames[1]}</span>
        </h1>
        <p className="vogue-event-subtitle">{eventTitle}</p>
      </div>

      {/* Vellum Sash Effect */}
      <div className="vogue-vellum-sash">
        <div className="vogue-wax-seal-emblem">
          <span>⚜</span>
        </div>
      </div>

      {/* Parents Section */}
      <div className="vogue-parents-block">
        <div className="vogue-parent-col">
          <span className="col-label">Nhà Trai</span>
          <p>Ông Chu Đức Long<br />Bà Nguyễn Thị Mai</p>
        </div>
        <div className="vogue-parent-divider" style={{ background: profile.accentColor }} />
        <div className="vogue-parent-col">
          <span className="col-label">Nhà Gái</span>
          <p>Ông Trần Hải Nam<br />Bà Lê Kim Phượng</p>
        </div>
      </div>

      {/* Itinerary Schedule */}
      <div className="vogue-schedule-grid">
        <div className="vogue-schedule-item">
          <span className="time-digit">10:30</span>
          <span className="time-sub">WELCOME COCKTAIL</span>
        </div>
        <div className="vogue-schedule-sep" style={{ color: profile.accentColor }}>✦</div>
        <div className="vogue-schedule-item">
          <span className="time-digit">11:30</span>
          <span className="time-sub">SOLEMN CEREMONY</span>
        </div>
        <div className="vogue-schedule-sep" style={{ color: profile.accentColor }}>✦</div>
        <div className="vogue-schedule-item">
          <span className="time-digit">12:00</span>
          <span className="time-sub">LUNCHEON SOIREE</span>
        </div>
      </div>

      {/* Date & Location */}
      <div className="vogue-venue-card">
        <div className="vogue-calendar-badge" style={{ color: profile.accentColor }}>
          CHỦ NHẬT · 28 THÁNG 11, 2026
        </div>
        <p className="vogue-venue-line">Grand Ballroom · Tầng 5 · InterContinental Landmark72</p>
        <p className="vogue-venue-address">{venue}</p>
      </div>

      {/* Romantic French Quote */}
      <div className="vogue-quote-box">
        <p className="vogue-french-quote">&ldquo;Deux âmes unies par la promesse de l’éternité.&rdquo;</p>
        <p className="vogue-viet-quote">
          {greeting || 'Khoảnh khắc trọn vẹn nhất khi có sự hiện diện và chúc phúc của quý khách.'}
        </p>
      </div>

      {/* Countdown Strip */}
      <div className="vogue-countdown-bar" style={{ borderColor: profile.borderColor }}>
        <div className="vogue-count-col"><strong>42</strong><small>DAYS</small></div>
        <div className="vogue-count-col"><strong>14</strong><small>HOURS</small></div>
        <div className="vogue-count-col"><strong>28</strong><small>MINUTES</small></div>
      </div>

      <InvitationAudioPlayer />

      <div className="vogue-card-footer">
        <span>✦ MORI ATELIER · HAUTE PAPETERIE VOGUE ✦</span>
      </div>
    </article>
  )
}
