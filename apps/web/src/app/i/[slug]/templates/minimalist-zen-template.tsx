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

export function MinimalistZenTemplate({
  profile,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  venue,
}: TemplateProps) {
  return (
    <article
      className="template-minimalist-zen"
      style={{
        backgroundColor: profile.cardBg,
        color: profile.textColor,
        borderColor: profile.borderColor,
      }}
    >
      <div className="zen-subtle-frame" style={{ borderColor: profile.borderColor }} />

      {/* Zen Ensō Circle & Mori Stamp */}
      <div className="zen-enso-seal-strip">
        <div className="zen-brush-enso" style={{ borderColor: profile.accentColor }} />
        <div className="zen-hanko-stamp">森</div>
      </div>

      <span className="zen-sub-concept" style={{ color: profile.accentColor }}>
        KYOTO WABI-SABI · TRẦM TĨNH &amp; THUẦN KHIẾT
      </span>

      {partyName ? (
        <div className="zen-guest-pill" style={{ borderColor: profile.borderColor }}>
          <span>Kính gửi: <strong>{partyName}</strong></span>
        </div>
      ) : null}

      {/* Zen Couple Title */}
      <div className="zen-names-block">
        <h1 className="zen-couple-title">
          <span>{displayNames[0]}</span>
          <span className="zen-kanji-knot" style={{ color: profile.accentColor }}>和</span>
          <span>{displayNames[1]}</span>
        </h1>
        <p className="zen-event-headline">{eventTitle}</p>
      </div>

      {/* Parents Minimal Strip */}
      <div className="zen-parents-strip">
        <div className="zen-parent-item">
          <small style={{ color: profile.accentColor }}>Nhà Trai</small>
          <span>Chu Đức Long · Nguyễn Thị Mai</span>
        </div>
        <div className="zen-sep">/</div>
        <div className="zen-parent-item">
          <small style={{ color: profile.accentColor }}>Nhà Gái</small>
          <span>Trần Hải Nam · Lê Kim Phượng</span>
        </div>
      </div>

      {/* Date & Ceremony Matrix */}
      <div className="zen-schedule-panel" style={{ borderColor: profile.borderColor }}>
        <div className="zen-date-line">
          <strong>28.11.2026</strong>
          <span>(Chủ Nhật · 20.10 Âm Lịch)</span>
        </div>

        <div className="zen-time-columns">
          <div className="zen-time-col">
            <span className="zen-time-val">10:30</span>
            <span className="zen-time-lbl">ĐÓN KHÁCH</span>
          </div>
          <div className="zen-time-col">
            <span className="zen-time-val">11:30</span>
            <span className="zen-time-lbl">HÔN LỄ</span>
          </div>
          <div className="zen-time-col">
            <span className="zen-time-val">12:00</span>
            <span className="zen-time-lbl">TIỆC TRƯA</span>
          </div>
        </div>

        <div className="zen-location-text">
          <p>Grand Ballroom · InterContinental Landmark72</p>
          <small>{venue}</small>
        </div>
      </div>

      {/* Wabi-Sabi Quiet Quote */}
      <div className="zen-quote-section">
        <p className="zen-haiku-quote">
          &ldquo;Chân ái như tĩnh thủy lưu thâm — Tình yêu sâu sắc như dòng nước êm đềm.&rdquo;
        </p>
        <p className="zen-personal-msg">
          {greeting || 'Trân trọng kính mời quý khách đến sẻ chia khoảnh khắc thanh tịnh và thiêng liêng nhất của chúng tôi.'}
        </p>
      </div>

      {/* Simple Countdown */}
      <div className="zen-countdown-box">
        <span>Còn lại: </span>
        <strong>42 ngày · 14 giờ · 28 phút</strong>
      </div>

      <InvitationAudioPlayer />

      <div className="zen-bottom-mark">
        <span>✦ MORI WABI-SABI ATELIER ✦</span>
      </div>
    </article>
  )
}
