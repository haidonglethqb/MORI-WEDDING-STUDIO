'use client'

import { useState } from 'react'
import { getBespokeProfile } from '../collections/collection-catalog-data'

interface Recommendation {
  slug: string
  name: string
  isFixture: boolean
  merchandiseVnd: string | null
}

const STYLE_OPTIONS = [
  { id: 'editorial', label: 'Editorial Vogue', icon: '✦', sub: 'High Fashion Paris' },
  { id: 'floral', label: 'Floral Botanical', icon: '❀', sub: 'Thảo mộc thanh nhã' },
  { id: 'traditional', label: 'Heritage Á Đông', icon: '囍', sub: 'Cung đình & Cát tường' },
  { id: 'minimalist', label: 'Minimalist Japandi', icon: '✤', sub: 'Wabi-Sabi tinh giản' },
  { id: 'modern', label: 'Modern Calligraphy', icon: '✒', sub: 'Thư pháp phóng khoáng' },
]

const QUANTITY_OPTIONS = ['30', '50', '100', '200', '300']

export function AssistantForm() {
  const [quantity, setQuantity] = useState('50')
  const [selectedStyle, setSelectedStyle] = useState('traditional')
  const [loading, setLoading] = useState(false)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [results, setResults] = useState<Recommendation[]>([])

  async function ask() {
    setLoading(true)
    setStatusNote('Đang xếp mẫu từ xưởng...')
    try {
      const response = await fetch('/assistant/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          productType: 'PAPER',
          shape: 'FLAT',
          styles: [selectedStyle],
          colours: [],
          quantity: Number(quantity) || 50,
          budgetVnd: null,
          budgetBasis: 'TOTAL',
        }),
      })
      const payload = (await response.json()) as { clarification?: string | null; results?: Recommendation[] }
      setLoading(false)
      if (!response.ok) {
        setResults([])
        setStatusNote(response.status === 409 ? 'Đã đạt giới hạn hỏi trong ngày.' : 'Chưa xếp được mẫu phù hợp.')
        return
      }
      setResults(payload.results ?? [])
      setStatusNote(
        payload.clarification
          ? 'Cần xác định thêm thông tin ngân sách.'
          : `Đã tìm thấy ${(payload.results ?? []).length} mẫu thiệp phù hợp nhất với phong cách của bạn.`,
      )
    } catch {
      setLoading(false)
      setStatusNote('Lỗi kết nối máy chủ.')
    }
  }

  return (
    <div>
      <div className="assistant-card">
        <h3 className="assistant-section-title">1. Chọn số lượng thiệp dự kiến</h3>
        <div className="quantity-pills">
          {QUANTITY_OPTIONS.map((q) => (
            <button
              key={q}
              type="button"
              className={`quantity-pill-btn ${quantity === q ? 'active' : ''}`}
              onClick={() => setQuantity(q)}
            >
              {q} bộ thiệp
            </button>
          ))}
        </div>

        <h3 className="assistant-section-title">2. Chọn phong cách chủ đạo hôn lễ</h3>
        <div className="style-chips-grid">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`style-chip-btn ${selectedStyle === opt.id ? 'active' : ''}`}
              onClick={() => setSelectedStyle(opt.id)}
            >
              <span className="style-chip-icon">{opt.icon}</span>
              <span className="style-chip-title">{opt.label}</span>
              <small style={{ fontSize: '11px', color: '#7a8174', display: 'block', marginTop: '2px' }}>
                {opt.sub}
              </small>
            </button>
          ))}
        </div>

        <button type="button" className="assistant-submit-btn" disabled={loading} onClick={() => void ask()}>
          {loading ? 'Đang tìm mẫu phù hợp...' : '✦ Xếp mẫu thiết kế phù hợp ngay'}
        </button>

        {statusNote && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#55634f', margin: '14px 0 0' }}>
            {statusNote}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <div className="results-section-wrap">
          <h2 style={{ fontFamily: 'var(--font-serif, "Lora", Georgia, serif)', fontSize: '24px', color: '#242823' }}>
            Gợi ý dành riêng cho bạn
          </h2>
          <div className="results-grid">
            {results.map((item) => {
              const profile = getBespokeProfile(item.slug)
              const title = profile?.title ?? item.name
              const subtitle = profile?.subtitle ?? 'Chế tác thủ công giấy bã mía 350gsm'
              const formattedPrice = item.merchandiseVnd
                ? `${Number(item.merchandiseVnd).toLocaleString('vi-VN')} ₫`
                : 'Từ 25.000 ₫'

              return (
                <div key={item.slug} className="recommend-item-card">
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b38e46', fontWeight: 700 }}>
                      ATELIER CURATED
                    </span>
                    <h4 className="recommend-item-title">{title}</h4>
                    <p style={{ fontSize: '13px', color: '#687063', margin: '0 0 12px' }}>{subtitle}</p>
                  </div>
                  <div>
                    <div className="recommend-item-price">{formattedPrice}</div>
                    <a href={`/products/${item.slug}`} className="recommend-item-cta">
                      Xem chi tiết &amp; 3D Studio &rarr;
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
