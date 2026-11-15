'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { readSelectedFont } from '../../features/cart/cart-store'

export function CustomDesignPanel() {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [coupleNames, setCoupleNames] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [estimatedQuantity, setEstimatedQuantity] = useState('200')
  const [stylePreference, setStylePreference] = useState('')
  const [fontCode, setFontCode] = useState('')
  const [fontName, setFontName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [requestCode, setRequestCode] = useState('')

  useEffect(() => {
    const savedFont = readSelectedFont()
    if (savedFont) {
      setFontCode(savedFont.code)
      setFontName(savedFont.name)
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg('')
    setSubmitting(true)
    try {
      const response = await fetch('/api/storefront/custom-requests', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          coupleNames: coupleNames.trim(),
          weddingDate: weddingDate.trim(),
          quantity: Number(estimatedQuantity) || 150,
          style: stylePreference.trim(),
          fontCode: fontCode.trim(),
          notes: notes.trim(),
        }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        request?: { id?: string }
        code?: string
        requestCode?: string
        id?: string
        message?: string
      }
      if (!response.ok) {
        setErrorMsg(data.message ?? 'Không thể gửi yêu cầu thiết kế lúc này. Vui lòng kiểm tra lại thông tin.')
        return
      }
      setRequestCode(data.request?.id ?? data.code ?? data.requestCode ?? data.id ?? 'TK-MORI')
    } catch {
      setErrorMsg('Kết nối tới xưởng MORI tạm gián đoạn. Vui lòng thử lại sau ít phút.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="group-section-wrap" id="thiet-ke-rieng">
      <div className="group-section-head">
        <span className="group-eyebrow">Nhóm 4 · Thiết kế độc bản</span>
        <h2>Thiết kế riêng — Gói Thiết Kế Thiệp Cưới MORI</h2>
        <p className="group-section-desc">
          Dành cho cặp đôi muốn sáng tạo bố cục, họa tiết minh họa hoặc dấu ấn monogram riêng biệt. Yêu cầu của bạn được chuyển thẳng tới đội ngũ Admin &amp; Xưởng thiết kế MORI.
        </p>
      </div>

      <div className="custom-design-grid">
        <div className="custom-form-card">
          {requestCode ? (
            <div className="custom-success-box" role="status">
              <h3>Đã tiếp nhận yêu cầu thiết kế riêng</h3>
              <p>
                Mã yêu cầu của bạn là <strong>{requestCode}</strong>. Thông tin đã được chuyển trực tiếp tới đội ngũ Admin / Xưởng MORI để lên phác thảo và báo giá chi tiết.
              </p>
              <button
                type="button"
                className="combo-qty-pill"
                onClick={() => {
                  setRequestCode('')
                  setNotes('')
                }}
              >
                Gửi thêm yêu cầu khác
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(event)}>
              {errorMsg ? <div className="custom-error-box">{errorMsg}</div> : null}
              <div className="custom-form-row">
                <div className="custom-field">
                  <label htmlFor="custom-name">Họ và tên *</label>
                  <input id="custom-name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nguyễn Minh Anh" />
                </div>
                <div className="custom-field">
                  <label htmlFor="custom-phone">Số điện thoại *</label>
                  <input id="custom-phone" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0901 234 567" />
                </div>
              </div>
              <div className="custom-form-row">
                <div className="custom-field">
                  <label htmlFor="custom-email">Email *</label>
                  <input id="custom-email" type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="minhanh@example.com" />
                </div>
                <div className="custom-field">
                  <label htmlFor="custom-couple">Tên cô dâu &amp; chú rể *</label>
                  <input id="custom-couple" required value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} placeholder="Minh Anh & Quốc Bảo" />
                </div>
              </div>
              <div className="custom-form-row">
                <div className="custom-field">
                  <label htmlFor="custom-date">Ngày cưới dự kiến</label>
                  <input id="custom-date" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
                </div>
                <div className="custom-field">
                  <label htmlFor="custom-qty">Số lượng dự kiến (bộ)</label>
                  <input id="custom-qty" type="number" min="1" max="10000" value={estimatedQuantity} onChange={(e) => setEstimatedQuantity(e.target.value)} />
                </div>
              </div>
              <div className="custom-form-row">
                <div className="custom-field">
                  <label htmlFor="custom-style">Phong cách / Màu sắc mong muốn</label>
                  <input id="custom-style" value={stylePreference} onChange={(e) => setStylePreference(e.target.value)} placeholder="Ví dụ: Botanical xanh olive, giấy ngà" />
                </div>
                <div className="custom-field">
                  <label htmlFor="custom-font">Mã font chữ</label>
                  <input id="custom-font" value={fontCode} onChange={(e) => setFontCode(e.target.value)} placeholder="VD: MF-01 (tùy chọn)" />
                  <span className="custom-font-hint">
                    {fontName ? `Đang chọn: ${fontName} · ` : ''}
                    <Link href="/fonts">Mở thư viện font chữ →</Link>
                  </span>
                </div>
              </div>
              <div className="custom-field">
                <label htmlFor="custom-notes">Mô tả ý tưởng thiết kế *</label>
                <textarea id="custom-notes" required value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Chia sẻ câu chuyện, họa tiết mong muốn, quy cách ép kim hoặc dập nổi..." />
              </div>
              <button type="submit" className="custom-submit-btn" disabled={submitting}>
                {submitting ? 'Đang gửi tới Xưởng MORI...' : 'Gửi yêu cầu thiết kế tới Admin MORI'}
              </button>
            </form>
          )}
        </div>

        <aside className="custom-intro-card">
          <h3>Gói Thiết Kế Thiệp Cưới Riêng</h3>
          <p className="group-section-desc">
            Đồng hành 1-1 cùng chuyên viên thiết kế MORI từ bản phác thảo ý tưởng đến kiểm duyệt bản in trên giấy bã mía 350gsm.
          </p>
          <ul className="custom-perks-list">
            <li>Lên layout, monogram và minh họa riêng theo câu chuyện hai bạn.</li>
            <li>Tùy biến bảng màu, font chữ tiếng Việt và quy cách dập nổi / ép kim.</li>
            <li>Nhận bản duyệt mẫu chi tiết trực tiếp từ Xưởng trước khi sản xuất.</li>
            <li>Ưu đãi giảm 50% khi làm kèm Thiệp Online đồng bộ chủ đề.</li>
          </ul>
        </aside>
      </div>
    </section>
  )
}
