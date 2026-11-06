'use client'

import { useState } from 'react'
import { MoriIcon } from '../components/mori-icon'

export function DigitalRsvpShowcase() {
  const [rsvpState, setRsvpState] = useState<'idle' | 'attending' | 'declined'>('idle')
  const [partyCount, setPartyCount] = useState(2)

  return (
    <div className="digital-interactive-container">
      {/* Smartphone Mockup */}
      <div className="phone-device-wrap">
        <div className="phone-bezel">
          <div className="phone-screen">
            <div className="phone-dynamic-island" />
            <div className="phone-status-bar">
              <span>09:41</span>
              <span>●●● 5G 100%</span>
            </div>

            <div className="phone-invitation-body">
              <span className="phone-invite-badge">MẪU THIỆP MINH HỌA</span>
              <div className="phone-monogram">MORI</div>
              <h3 className="phone-couple-names">Tên hai bạn</h3>
              <p className="phone-event-date">Ngày tổ chức</p>
              <p className="phone-venue">Địa điểm · Thành phố</p>

              {/* Countdown Bar */}
              <div className="phone-countdown-box">
                <span className="phone-schedule-label">Lịch trình và thông tin sự kiện</span>
              </div>

              {/* Personal invitation detail */}
              <div className="phone-audio-bar">
                <MoriIcon className="audio-play-icon" name="envelope" />
                <div className="audio-info">
                  <span className="audio-title">Lời mời dành riêng cho bạn</span>
                </div>
              </div>

              {/* Interactive RSVP Card */}
              <div className="phone-rsvp-box">
                {rsvpState === 'idle' ? (
                  <>
                    <p className="rsvp-prompt">Mô phỏng phản hồi RSVP</p>
                    <div className="rsvp-selector-row">
                      <span>Số lượng khách:</span>
                      <div className="rsvp-counter">
                        <button
                          type="button"
                          onClick={() => setPartyCount(Math.max(1, partyCount - 1))}
                            className="counter-btn"
                            aria-label="Giảm số khách minh họa"
                        >
                          -
                        </button>
                        <span>{partyCount}</span>
                        <button
                          type="button"
                          onClick={() => setPartyCount(Math.min(5, partyCount + 1))}
                            className="counter-btn"
                            aria-label="Tăng số khách minh họa"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="rsvp-buttons-group">
                      <button
                        type="button"
                        onClick={() => setRsvpState('attending')}
                        className="rsvp-yes-btn"
                      >
                        ✓ Sẽ tham dự ({partyCount} khách)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpState('declined')}
                        className="rsvp-no-btn"
                      >
                        Không thể tham dự
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rsvp-confirmed-view">
                    <MoriIcon className="confirmed-icon" name="check" />
                    <strong className="confirmed-title">
                      {rsvpState === 'attending'
                        ? `Mẫu hiển thị: ${partyCount} khách tham dự.`
                        : 'Mẫu hiển thị: không thể tham dự.'}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setRsvpState('idle')}
                      className="rsvp-reset-btn"
                    >
                      Thay đổi phản hồi ↺
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights on the right */}
      <div className="digital-feature-content">
        <span className="section-eyebrow">03 / THIỆP TRỰC TUYẾN</span>
        <h2>Lời mời đi xa.<br />Ngày vui gần lại.</h2>
        <p className="digital-lead-text">
          Một đường dẫn dành riêng cho ngày cưới. Khách xem lời mời và xác nhận tham dự ngay trên điện thoại.
        </p>

        <div className="digital-perks-list">
          <div className="digital-perk-card">
            <MoriIcon className="perk-icon-wrap" name="check" />
            <div>
              <h4>Theo dõi phản hồi</h4>
              <p>Quản lý phản hồi và số lượng khách theo từng sự kiện trong không gian làm việc.</p>
            </div>
          </div>

          <div className="digital-perk-card">
            <MoriIcon className="perk-icon-wrap" name="envelope" />
            <div>
              <h4>Lời mời riêng cho từng khách</h4>
              <p>Cá nhân hóa liên kết mời để khách mở đúng thông tin dành cho mình.</p>
            </div>
          </div>

          <div className="digital-perk-card">
            <MoriIcon className="perk-icon-wrap" name="map-pin" />
            <div>
              <h4>Địa điểm và lịch sự kiện</h4>
              <p>Giúp khách xem thông tin ngày vui và tải lịch sự kiện khi bạn đã cập nhật thời gian.</p>
            </div>
          </div>
        </div>

        <div className="digital-cta-row">
          <a href="/workspace" className="home-cta">
            Tạo thiệp trực tuyến
          </a>
          <a href="/assistant" className="home-quiet">
            Hỏi trợ lý stylist &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
