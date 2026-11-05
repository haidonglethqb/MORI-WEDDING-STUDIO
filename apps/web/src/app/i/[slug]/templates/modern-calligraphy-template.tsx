'use client'

import type { DigitalModelProfile } from '../invitation-model-profiles'
import { InvitationAudioPlayer } from '../invitation-audio-player'
import { InvitationCalendarAction } from '../invitation-calendar-action'

interface TemplateProps {
  profile: DigitalModelProfile
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
  partyName?: string | null | undefined
  venue: string
}

export function ModernCalligraphyTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-calligraphy-artisan"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="calligraphy-deckle-edge" />

      {/* Wax Seal Monogram with Drape */}
      <div className="calligraphy-wax-ribbon">
        <div className="silk-ribbon-line" style={{ background: profile.accentColor }} />
        <div className="hand-wax-seal" style={{ borderColor: profile.accentColor }}>
          <span className="seal-quill">✒</span>
          <span className="seal-initials">M · T</span>
        </div>
      </div>

      <span className="calligraphy-badge-tag" style={{ color: profile.accentColor }}>
        FLORENCE ARTISAN CALLIGRAPHY · EST. 2026
      </span>

      {partyName ? (
        <div className="calligraphy-guest-pill" style={{ borderColor: profile.accentColor }}>
          <span>Trân trọng kính mời: <strong>{partyName}</strong></span>
        </div>
      ) : null}

      {/* Parents Formal Block */}
      <div className="calligraphy-parents-block">
        <div className="c-family-col">
          <span className="c-tag" style={{ color: profile.accentColor }}>Song Thân Nhà Trai</span>
          <p>Ông Chu Đức Long<br />Bà Nguyễn Thị Mai</p>
        </div>
        <div className="c-amp-sep" style={{ color: profile.accentColor }}>❦</div>
        <div className="c-family-col">
          <span className="c-tag" style={{ color: profile.accentColor }}>Song Thân Nhà Gái</span>
          <p>Ông Trần Hải Nam<br />Bà Lê Kim Phượng</p>
        </div>
      </div>

      <p className="calligraphy-lead-line">
        Kính mời quý vị cùng chứng kiến và chung vui trong ngày đính ước trọn đời của
      </p>

      {/* Flourished Script Couple Name */}
      <div className="calligraphy-hero-names">
        <h1 className="flourished-name-script">
          <span className="calligraphy-first">{displayNames[0]}</span>
          <span className="calligraphy-swash" style={{ color: profile.accentColor }}>&amp;</span>
          <span className="calligraphy-second">{displayNames[1]}</span>
        </h1>
        <p className="calligraphy-event-title">{eventTitle}</p>
      </div>

      {/* Letterpress Style Schedule Card */}
      <div className="calligraphy-press-card" style={{ borderColor: profile.borderColor }}>
        <div className="press-date-header" style={{ color: profile.accentColor }}>
          CHỦ NHẬT · 28 THÁNG 11, 2026
        </div>
        <span className="press-lunar-sub">(Ngày 20 Tháng 10 Năm Bính Ngọ)</span>

        <div className="press-timeline-row">
          <div className="press-time-unit">
            <span className="p-hour">10:30</span>
            <small>ĐÓN KHÁCH</small>
          </div>
          <span className="p-dot" style={{ color: profile.accentColor }}>✦</span>
          <div className="press-time-unit">
            <span className="p-hour">11:30</span>
            <small>LỄ GIAO BÔI</small>
          </div>
          <span className="p-dot" style={{ color: profile.accentColor }}>✦</span>
          <div className="press-time-unit">
            <span className="p-hour">12:00</span>
            <small>TIỆC CƯỚI</small>
          </div>
        </div>

        <div className="press-venue-info">
          <strong>Sảnh Grand Ballroom · Tầng 5</strong>
          <address>{venue}</address>
        </div>
      </div>

      {/* Romantic Calligraphy Love Note */}
      <div className="calligraphy-letter-note">
        <p>
          &ldquo;{greeting || 'Tình yêu đẹp như nét bút lụa mềm mại vắt ngang tháng năm. Chúng mình tha thiết mong được đón tiếp bạn trong ngày vui này.'}&rdquo;
        </p>
      </div>

      {/* Countdown Box */}
      <div className="calligraphy-countdown-bar" style={{ borderColor: profile.borderColor }}>
        <div className="c-count-unit"><strong>42</strong><small>Ngày</small></div>
        <span style={{ color: profile.accentColor }}>❦</span>
        <div className="c-count-unit"><strong>14</strong><small>Giờ</small></div>
        <span style={{ color: profile.accentColor }}>❦</span>
        <div className="c-count-unit"><strong>28</strong><small>Phút</small></div>
      </div>

      <InvitationAudioPlayer />
      <InvitationCalendarAction title={eventTitle} venue={venue} displayNames={displayNames} />

      <div className="calligraphy-footer-sign" style={{ color: profile.accentColor }}>
        <span>✒ MORI BESPOKE CALLIGRAPHY PRESS · ARTISAN EDITION ✒</span>
      </div>
    </article>
  )
}
