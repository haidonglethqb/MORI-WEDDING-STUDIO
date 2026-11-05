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

export function HeritageAsianTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-heritage-asian"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="heritage-corner-pattern c-tl" />
      <div className="heritage-corner-pattern c-tr" />
      <div className="heritage-corner-pattern c-bl" />
      <div className="heritage-corner-pattern c-br" />
      <div className="heritage-inner-frame" style={{ borderColor: profile.borderColor }} />

      {/* Royal Double Happiness Emblem */}
      <div className="heritage-joy-crest">
        <div className="imperial-joy-symbol" style={{ color: profile.accentColor }}>
          囍
        </div>
        <span className="heritage-banner-txt">HOÀNG GIA ĐẠI LỄ · KIM NGỌC MÃN ĐƯỜNG</span>
      </div>

      {partyName ? (
        <div className="heritage-guest-pill" style={{ borderColor: profile.accentColor }}>
          <span style={{ color: profile.accentColor }}>Kính mời:</span>
          <strong>{partyName}</strong>
        </div>
      ) : null}

      {/* Family Roster Header */}
      <div className="heritage-parents-grid">
        <div className="heritage-family-box">
          <span className="family-side-title" style={{ color: profile.accentColor }}>NHÀ TRAI</span>
          <strong className="family-head">Ông Chu Đức Long</strong>
          <strong className="family-head">Bà Nguyễn Thị Mai</strong>
          <span className="family-origin">Hà Nội, Việt Nam</span>
        </div>
        <div className="heritage-center-seal" style={{ color: profile.accentColor }}>
          ✤
        </div>
        <div className="heritage-family-box">
          <span className="family-side-title" style={{ color: profile.accentColor }}>NHÀ GÁI</span>
          <strong className="family-head">Ông Trần Hải Nam</strong>
          <strong className="family-head">Bà Lê Kim Phượng</strong>
          <span className="family-origin">Hà Nội, Việt Nam</span>
        </div>
      </div>

      <p className="heritage-ceremony-lead">
        Trân trọng kính báo tin Lễ Thành Hôn của hai con chúng tôi:
      </p>

      {/* Bride & Groom Traditional Presentation */}
      <div className="heritage-couple-box">
        <div className="heritage-bridegroom">
          <span className="role-tag" style={{ color: profile.accentColor }}>TÂN LANG (Trưởng Nam)</span>
          <h1 className="name-bold">{displayNames[0]}</h1>
        </div>
        <div className="heritage-duo-knot" style={{ color: profile.accentColor }}>
          ✦ KẾT TÓC GIAO DUYÊN ✦
        </div>
        <div className="heritage-bridegroom">
          <span className="role-tag" style={{ color: profile.accentColor }}>TÂN NƯƠNG (Ái Nữ)</span>
          <h1 className="name-bold">{displayNames[1]}</h1>
        </div>
      </div>

      <p className="heritage-event-name">{eventTitle}</p>

      {/* Auspicious Lunar & Solar Date Card */}
      <div className="heritage-auspicious-card" style={{ borderColor: profile.accentColor }}>
        <span className="auspicious-ribbon" style={{ background: profile.accentColor, color: '#3d1211' }}>
          HOÀNG ĐẠO CÁT NHẬT
        </span>
        <div className="auspicious-solar-date">
          CHỦ NHẬT · NGÀY 28 THÁNG 11 NĂM 2026
        </div>
        <div className="auspicious-lunar-date" style={{ color: profile.accentColor }}>
          (Tức Ngày 20 Tháng 10 Năm Bính Ngọ)
        </div>
        <div className="auspicious-hour-line">
          Lễ Thành Hôn cử hành vào hồi: <strong>11 Giờ 30 Phút</strong>
        </div>
        <div className="auspicious-venue-line">
          Tiệc mừng tổ chức tại: <strong>Sảnh Grand Ballroom · Tầng 5</strong>
        </div>
        <address className="auspicious-street-line">{venue}</address>
      </div>

      {/* Blessing Note */}
      <div className="heritage-blessing-note">
        <p>
          &ldquo;{greeting || 'Sự hiện diện và lời chúc phúc của quý khách là niềm hoan hỷ lớn lao cho đôi trẻ và toàn thể hai gia đình chúng tôi.'}&rdquo;
        </p>
      </div>

      {/* Countdown Strip */}
      <div className="heritage-countdown-strip" style={{ borderColor: profile.borderColor }}>
        <div className="h-count-unit"><strong>42</strong><small>Ngày</small></div>
        <span>·</span>
        <div className="h-count-unit"><strong>14</strong><small>Giờ</small></div>
        <span>·</span>
        <div className="h-count-unit"><strong>28</strong><small>Phút</small></div>
      </div>

      <InvitationAudioPlayer />
      <InvitationCalendarAction title={eventTitle} venue={venue} displayNames={displayNames} />

      <div className="heritage-footer-seal" style={{ color: profile.accentColor }}>
        <span>囍 BÁCH NIÊN GIAI LÃO · PHỤNG VŨ NGHINH XUÂN 囍</span>
      </div>
    </article>
  )
}
