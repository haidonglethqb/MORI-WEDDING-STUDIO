'use client'

import { useState } from 'react'

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
              <span className="phone-invite-badge">✦ THIỆP CƯỚI TRỰC TUYẾN ✦</span>
              <div className="phone-monogram">M &amp; T</div>
              <h3 className="phone-couple-names">Minh Sơn &amp; Thảo Vy</h3>
              <p className="phone-event-date">Chủ Nhật · 28 Tháng 11, 2026</p>
              <p className="phone-venue">InterContinental Landmark 72 · Hà Nội</p>

              {/* Countdown Bar */}
              <div className="phone-countdown-box">
                <div className="count-unit"><strong>42</strong><small>Ngày</small></div>
                <div className="count-sep">:</div>
                <div className="count-unit"><strong>14</strong><small>Giờ</small></div>
                <div className="count-sep">:</div>
                <div className="count-unit"><strong>28</strong><small>Phút</small></div>
              </div>

              {/* Audio Player Strip */}
              <div className="phone-audio-bar">
                <span className="audio-play-icon">▶</span>
                <div className="audio-info">
                  <span className="audio-title">Canon in D · Piano Acoustic</span>
                  <div className="audio-waves">
                    <span className="wave-bar w1" />
                    <span className="wave-bar w2" />
                    <span className="wave-bar w3" />
                    <span className="wave-bar w4" />
                  </div>
                </div>
              </div>

              {/* Interactive RSVP Card */}
              <div className="phone-rsvp-box">
                {rsvpState === 'idle' ? (
                  <>
                    <p className="rsvp-prompt">Bạn sẽ cùng chung vui chứ?</p>
                    <div className="rsvp-selector-row">
                      <span>Số lượng khách:</span>
                      <div className="rsvp-counter">
                        <button
                          type="button"
                          onClick={() => setPartyCount(Math.max(1, partyCount - 1))}
                          className="counter-btn"
                        >
                          -
                        </button>
                        <span>{partyCount}</span>
                        <button
                          type="button"
                          onClick={() => setPartyCount(Math.min(5, partyCount + 1))}
                          className="counter-btn"
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
                        Gửi lời chúc từ xa
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rsvp-confirmed-view">
                    <span className="confirmed-icon">💐</span>
                    <strong className="confirmed-title">
                      {rsvpState === 'attending'
                        ? `Tuyệt vời! Đã ghi nhận ${partyCount} khách tham dự.`
                        : 'Cảm ơn lời chúc chân thành từ bạn!'}
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
        <span className="section-eyebrow">Trải nghiệm số độc bản</span>
        <h2>Trang thiệp cưới điện tử RSVP tương tác đa chiều</h2>
        <p className="digital-lead-text">
          Được thiết kế đồng bộ với bộ thiệp giấy của bạn. Khách mời mở thiệp qua liên kết riêng tư, không cần cài đặt ứng dụng,
          xác nhận số lượng người đi cùng trong vài giây và xem chỉ đường Google Maps nhanh chóng.
        </p>

        <div className="digital-perks-list">
          <div className="digital-perk-card">
            <div className="perk-icon-wrap">⚡</div>
            <div>
              <h4>Đồng bộ dữ liệu thời gian thực</h4>
              <p>Mỗi lượt xác nhận RSVP được cập nhật ngay lập tức vào bảng quản lý của cô dâu chú rể, tự động tính tổng số bàn tiệc.</p>
            </div>
          </div>

          <div className="digital-perk-card">
            <div className="perk-icon-wrap">💌</div>
            <div>
              <h4>Cá nhân hóa từng vị khách quý</h4>
              <p>Mỗi khách mời nhận một thiệp với tên riêng (ví dụ: &ldquo;Kính mời: Anh Hoàng Nam &amp; Bạn&rdquo;) đảm bảo sự trang trọng.</p>
            </div>
          </div>

          <div className="digital-perk-card">
            <div className="perk-icon-wrap">🗺️</div>
            <div>
              <h4>Chỉ đường &amp; Lịch tiệc thông minh</h4>
              <p>Tích hợp bản đồ dẫn đường chính xác và nút bấm thêm sự kiện vào Google Calendar / Apple Calendar chỉ với 1 chạm.</p>
            </div>
          </div>
        </div>

        <div className="digital-cta-row">
          <a href="/collections" className="home-cta">
            Khám phá các mẫu thiệp số
          </a>
          <a href="/assistant" className="home-quiet">
            Hỏi trợ lý stylist &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
