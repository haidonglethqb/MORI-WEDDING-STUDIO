'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FONT_VARIABLE_CLASSNAME } from './font-loaders'
import { MORI_FONT_GROUPS, SAMPLE_INVITE_LINE, type MoriFontSample } from './fonts-data'

const STORAGE_KEY = 'mori_selected_font'

interface SavedFontChoice {
  code: string
  name: string
}

function readStoredFont(): SavedFontChoice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as SavedFontChoice).code === 'string' &&
      typeof (parsed as SavedFontChoice).name === 'string'
    ) {
      return parsed as SavedFontChoice
    }
    return null
  } catch {
    return null
  }
}

export function FontsGallery() {
  const [brideName, setBrideName] = useState('Minh Anh')
  const [groomName, setGroomName] = useState('Gia Huy')
  const [selected, setSelected] = useState<SavedFontChoice | null>(null)

  useEffect(() => {
    setSelected(readStoredFont())
  }, [])

  const displayPair = `${brideName.trim() || 'Minh Anh'} & ${groomName.trim() || 'Gia Huy'}`

  const handleSelectFont = (font: MoriFontSample) => {
    const choice: SavedFontChoice = { code: font.code, name: font.name }
    setSelected(choice)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
    } catch {
      // Bỏ qua nếu trình duyệt chặn storage
    }
  }

  return (
    <div className={`fonts-gallery-root ${FONT_VARIABLE_CLASSNAME}`}>
      <section className="fonts-preview-controls" aria-label="Xem thử tên cô dâu và chú rể">
        <div className="fonts-preview-inputs">
          <div className="fonts-input-field">
            <label htmlFor="mori-bride-name">Nhập tên cô dâu</label>
            <input
              id="mori-bride-name"
              type="text"
              value={brideName}
              onChange={(event) => setBrideName(event.target.value)}
              placeholder="Minh Anh"
              maxLength={40}
            />
          </div>
          <div className="fonts-input-field">
            <label htmlFor="mori-groom-name">Nhập tên chú rể</label>
            <input
              id="mori-groom-name"
              type="text"
              value={groomName}
              onChange={(event) => setGroomName(event.target.value)}
              placeholder="Gia Huy"
              maxLength={40}
            />
          </div>
        </div>

        <div className="fonts-paper-preview-strip">
          <img
            src="/images/landing/roster-paper-swatches.jpg"
            alt="Mẫu chữ in trên chất liệu giấy xơ bã mía tại MORI"
          />
          <div>
            <strong>Xem thử trực tiếp trên nền giấy xơ bã mía</strong>
            <p>
              Toàn bộ 16 mã font từ <code>MORI F01</code> đến <code>MORI F16</code> đều hỗ trợ
              đầy đủ tiếng Việt có dấu cho cụm tên <strong>{displayPair}</strong> và lời mời cưới.
            </p>
          </div>
        </div>

        {selected && (
          <div className="fonts-selected-banner" role="status">
            <span>
              Đã lưu mã font <strong>{selected.code}</strong> ({selected.name}) cho yêu cầu thiết kế
              thiệp của bạn.
            </span>
            <div className="fonts-selected-links">
              <Link href="/collections?tab=custom" className="guide-btn-primary">
                Gửi yêu cầu thiết kế riêng
              </Link>
              <Link href="/collections" className="guide-btn-secondary">
                Xem bộ sưu tập
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="fonts-groups-stack">
        {MORI_FONT_GROUPS.map((group) => (
          <section key={group.id} className="fonts-group-section" aria-labelledby={`fg-${group.id}`}>
            <header className="fonts-group-header">
              <h2 id={`fg-${group.id}`}>{group.title}</h2>
              <p>{group.description}</p>
            </header>

            <div className="fonts-grid">
              {group.fonts.map((font) => {
                const isSelected = selected?.code === font.code
                const fontFamily = `var(${font.cssVar}), ${font.fallbackFamily}`
                return (
                  <article
                    key={font.code}
                    className={`font-sample-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="font-sample-top">
                      <span className="font-code-badge">{font.code}</span>
                      <span className="font-tech-name">{font.name}</span>
                    </div>

                    <div className="font-specimen-paper">
                      <p className="font-couple-line" style={{ fontFamily }}>
                        {displayPair}
                      </p>
                      <p className="font-invite-line" style={{ fontFamily }}>
                        {SAMPLE_INVITE_LINE}
                      </p>
                    </div>

                    <p className="font-style-note">{font.styleNote}</p>

                    <div className="font-card-footer">
                      <button
                        type="button"
                        className={`font-select-btn ${isSelected ? 'is-chosen' : ''}`}
                        onClick={() => handleSelectFont(font)}
                      >
                        {isSelected ? '✓ Đã chọn font này' : 'Chọn font này'}
                      </button>
                      {isSelected && (
                        <Link href="/collections?tab=custom" className="font-quick-use-link">
                          Dùng cho thiết kế →
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
