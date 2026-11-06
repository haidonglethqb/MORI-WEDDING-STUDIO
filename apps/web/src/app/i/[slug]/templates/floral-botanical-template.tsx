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

export function FloralBotanicalTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-floral-botanical"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="floral-deckle-border" style={{ borderColor: profile.borderColor }} />

      {/* Top Botanical Wreath & Crest */}
      <div className="floral-header-spray">
        <svg className="floral-svg-branch" viewBox="0 0 120 28" fill="none">
          <path d="M5 20C30 5 60 25 90 10C105 5 115 15 118 15" stroke={profile.accentColor} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="30" cy="11" r="2.5" fill={profile.accentColor} />
          <circle cx="65" cy="18" r="2.5" fill={profile.accentColor} />
          <circle cx="95" cy="10" r="2.5" fill={profile.accentColor} />
        </svg>
        <span className="floral-garden-tag" style={{ color: profile.accentColor }}>
          JARDIN BOTANIQUE · PROVENCE
        </span>
      </div>

      {partyName ? (
        <div className="floral-guest-pill" style={{ borderColor: profile.accentColor }}>
          <span className="leaf-icon" aria-hidden="true" />
          <span>Trân trọng kính mời: <strong>{partyName}</strong></span>
        </div>
      ) : null}

      {/* Parents Botanical Block */}
      <div className="floral-parents-row">
        <div className="floral-family-side">
          <span className="side-caption" style={{ color: profile.accentColor }}>Nhà Trai</span>
          <p>Ông Chu Đức Long<br />Bà Nguyễn Thị Mai</p>
        </div>
        <div className="floral-wreath-center" style={{ color: profile.accentColor }}>
          ❀
        </div>
        <div className="floral-family-side">
          <span className="side-caption" style={{ color: profile.accentColor }}>Nhà Gái</span>
          <p>Ông Trần Hải Nam<br />Bà Lê Kim Phượng</p>
        </div>
      </div>

      {/* Couple Romantic Names */}
      <div className="floral-couple-wrap">
        <span className="floral-invite-line" style={{ color: profile.accentColor }}>
          Hân hoan kính mời quý khách tham dự lễ cưới của
        </span>
        <h1 className="floral-script-title">
          <span>{displayNames[0]}</span>
          <span className="floral-amp" style={{ color: profile.accentColor }}>&amp;</span>
          <span>{displayNames[1]}</span>
        </h1>
        <p className="floral-event-sub">{eventTitle}</p>
      </div>

      {/* Garden Card Details */}
      <div className="floral-details-card" style={{ borderColor: profile.borderColor }}>
        <div className="floral-calendar-top" style={{ color: profile.accentColor }}>
          CHỦ NHẬT · 28 THÁNG 11, 2026
        </div>
        <p className="floral-lunar-date">(Nhằm ngày 20 tháng 10 năm Bính Ngọ)</p>

        <div className="floral-itinerary">
          <div className="itinerary-slot">
            <strong>10:30</strong>
            <small>ĐÓN KHÁCH</small>
          </div>
          <span className="itinerary-dot" style={{ color: profile.accentColor }}>•</span>
          <div className="itinerary-slot">
            <strong>11:30</strong>
            <small>THÀNH HÔN</small>
          </div>
          <span className="itinerary-dot" style={{ color: profile.accentColor }}>•</span>
          <div className="itinerary-slot">
            <strong>12:00</strong>
            <small>TIỆC CƯỚI</small>
          </div>
        </div>

        <div className="floral-venue-box">
          <span className="floral-hall">Sảnh Grand Ballroom · Tầng 5</span>
          <address className="floral-address">{venue}</address>
        </div>
      </div>

      {/* Botanical Message */}
      <div className="floral-message-box">
        <p>
          &ldquo;{greeting || 'Như những đóa hoa ngát hương trong sớm mai, tình yêu của chúng mình nở rộ trọn vẹn nhất trong sự hiện diện của bạn.'}&rdquo;
        </p>
      </div>

      {/* Countdown Strip */}
      <div className="floral-countdown-wrap" style={{ borderColor: profile.borderColor }}>
        <div className="f-count"><strong>42</strong><small>Ngày</small></div>
        <span className="f-sep" style={{ color: profile.accentColor }}>❀</span>
        <div className="f-count"><strong>14</strong><small>Giờ</small></div>
        <span className="f-sep" style={{ color: profile.accentColor }}>❀</span>
        <div className="f-count"><strong>28</strong><small>Phút</small></div>
      </div>

      <InvitationAudioPlayer />

      {/* Bottom Garland */}
      <div className="floral-footer-spray">
        <span style={{ color: profile.accentColor }}>MORI · THIỆP MỜI</span>
      </div>
    </article>
  )
}
