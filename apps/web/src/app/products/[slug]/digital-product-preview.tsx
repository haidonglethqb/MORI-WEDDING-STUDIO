'use client'

import { useState } from 'react'

interface DigitalProductPreviewProps {
  slug: string
  title: string
  accentColor?: string | undefined
}

export function DigitalProductPreview({
  slug,
  title,
  accentColor = '#657344',
}: DigitalProductPreviewProps) {
  const [coupleName, setCoupleName] = useState('Minh Anh & Quốc Bảo')
  const [guestCount, setGuestCount] = useState(2)
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)

  const sampleLink = `https://mori.vn/i/${slug}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(sampleLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="digital-preview-stage">
      <div className="digital-preview-header">
        <span className="digital-preview-badge">XEM TRƯỚC THIỆP ONLINE</span>
        <span style={{ fontSize: '12px', color: '#56604d' }}>Giao diện website di động</span>
      </div>

      <div className="order-box-field" style={{ marginBottom: '12px' }}>
        <label htmlFor="demo-couple-input">Thử nhập tên hai bạn trên thiệp mẫu:</label>
        <input
          id="demo-couple-input"
          type="text"
          value={coupleName}
          onChange={(event) => setCoupleName(event.target.value)}
          style={{
            minHeight: '38px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #d5cfc0',
            background: '#fffcf7',
          }}
        />
      </div>

      <div className="digital-phone-frame" style={{ borderColor: accentColor }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: accentColor, fontWeight: 700 }}>
          SAVE THE DATE · {title.toUpperCase()}
        </span>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '21px', margin: '10px 0 4px', color: '#1f241d' }}>
          {coupleName || 'Minh Anh & Quốc Bảo'}
        </h3>
        <p style={{ fontSize: '12px', color: '#5d6658', margin: '0 0 4px' }}>
          Chủ Nhật, 20 Tháng 12, 2026 · 18:00
        </p>
        <p style={{ fontSize: '11px', color: '#757e6f', margin: 0 }}>
          White Palace · 194 Hoàng Văn Thụ, TP.HCM
        </p>

        <div className="digital-countdown-row">
          <div className="digital-count-cell">
            <strong>18</strong>
            <span>Ngày</span>
          </div>
          <div className="digital-count-cell">
            <strong>06</strong>
            <span>Giờ</span>
          </div>
          <div className="digital-count-cell">
            <strong>24</strong>
            <span>Phút</span>
          </div>
        </div>

        <div className="digital-share-bar">
          <span>{sampleLink}</span>
          <button type="button" onClick={() => void copyLink()}>
            {copied ? 'Đã chép ✓' : 'Sao chép'}
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#4f5c31', background: '#e8ebdd', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
          Bản đồ chỉ đường Google Maps tích hợp sẵn
        </div>

        <div className="digital-rsvp-card">
          {rsvpConfirmed ? (
            <div>
              <strong style={{ color: '#445225' }}>
                Đã xác nhận tham dự ({guestCount} khách) ✓
              </strong>
              <div>
                <button
                  type="button"
                  onClick={() => setRsvpConfirmed(false)}
                  style={{
                    marginTop: '6px',
                    background: 'transparent',
                    border: 0,
                    color: '#657344',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Thử lại RSVP
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Mô phỏng nút Xác nhận tham dự (RSVP)</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                  style={{ width: '24px', height: '24px', borderRadius: '999px', border: '1px solid #ccc' }}
                >
                  -
                </button>
                <span>{guestCount} khách</span>
                <button
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.min(8, prev + 1))}
                  style={{ width: '24px', height: '24px', borderRadius: '999px', border: '1px solid #ccc' }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="digital-rsvp-btn"
                onClick={() => setRsvpConfirmed(true)}
              >
                Xác nhận tham dự ({guestCount} khách)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
