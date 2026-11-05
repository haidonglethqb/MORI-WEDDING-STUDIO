'use client'

import { useState } from 'react'

const QUANTITY_CHOICES = [50, 100, 150, 200, 300]

export function WeddingEstimator() {
  const [quantity, setQuantity] = useState(100)
  const [shape, setShape] = useState<'FLAT' | 'BIFOLD'>('BIFOLD')
  const [deckle, setDeckle] = useState(true)
  const [hotFoil, setHotFoil] = useState(true)
  const [waxSeal, setWaxSeal] = useState(false)

  // Calculations in BigInt VND per rule 5
  const basePricePerUnit = shape === 'FLAT' ? 28000n : 42000n
  const decklePerUnit = deckle ? 2000n : 0n
  const foilPerUnit = hotFoil ? 3500n : 0n
  const waxPerUnit = waxSeal ? 4000n : 0n

  const unitTotal = basePricePerUnit + decklePerUnit + foilPerUnit + waxPerUnit
  const grandTotal = unitTotal * BigInt(quantity)

  return (
    <div className="estimator-container">
      <div className="estimator-controls">
        <div className="estimator-group">
          <label className="estimator-label">1. Số lượng bộ thiệp dự kiến</label>
          <div className="quantity-pills-row">
            {QUANTITY_CHOICES.map((q) => (
              <button
                key={q}
                type="button"
                className={`estimator-pill ${quantity === q ? 'active' : ''}`}
                onClick={() => setQuantity(q)}
              >
                {q} bộ
              </button>
            ))}
          </div>
        </div>

        <div className="estimator-group">
          <label className="estimator-label">2. Kiểu dáng quy cách thiệp</label>
          <div className="shape-selection-grid">
            <button
              type="button"
              className={`shape-card-btn ${shape === 'FLAT' ? 'active' : ''}`}
              onClick={() => setShape('FLAT')}
            >
              <span className="shape-card-tag">Đơn phẳng · 2 mặt</span>
              <strong className="shape-card-name">Flat Card Élysée</strong>
              <small className="shape-card-sub">Từ 28.000 ₫ / bộ</small>
            </button>
            <button
              type="button"
              className={`shape-card-btn ${shape === 'BIFOLD' ? 'active' : ''}`}
              onClick={() => setShape('BIFOLD')}
            >
              <span className="shape-card-tag">Gấp đôi · 4 mặt</span>
              <strong className="shape-card-name">Bi-fold Paris Vogue</strong>
              <small className="shape-card-sub">Từ 42.000 ₫ / bộ</small>
            </button>
          </div>
        </div>

        <div className="estimator-group">
          <label className="estimator-label">3. Tùy chọn nâng cấp kỹ thuật thủ công</label>
          <div className="addon-checkbox-list">
            <label className="addon-check-item">
              <input
                type="checkbox"
                checked={deckle}
                onChange={(e) => setDeckle(e.target.checked)}
              />
              <div className="addon-text">
                <strong>Mép xé thủ công Deckle Edge</strong>
                <small>Xé ướt viền cổ điển (+2.000 ₫/bộ)</small>
              </div>
            </label>

            <label className="addon-check-item">
              <input
                type="checkbox"
                checked={hotFoil}
                onChange={(e) => setHotFoil(e.target.checked)}
              />
              <div className="addon-text">
                <strong>Ép kim chìm lá vàng nhiệt độ cao 160°C</strong>
                <small>Dập chìm tên cô dâu chú rể (+3.500 ₫/bộ)</small>
              </div>
            </label>

            <label className="addon-check-item">
              <input
                type="checkbox"
                checked={waxSeal}
                onChange={(e) => setWaxSeal(e.target.checked)}
              />
              <div className="addon-text">
                <strong>Con dấu sáp Atelier Monogram &amp; Lụa tơ tằm</strong>
                <small>Đóng dấu sáp niêm phong thiệp (+4.000 ₫/bộ)</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="estimator-result-card">
        <div className="estimator-result-top">
          <span className="estimator-summary-tag">DỰ TOÁN MINH BẠCH</span>
          <h4 className="estimator-summary-title">Bộ thiệp cưới hoàn thiện</h4>
          <p className="estimator-summary-subtitle">Đã bao gồm phong bì bã mía &amp; thiết kế may đo</p>
        </div>

        <div className="estimator-breakdown-lines">
          <div className="breakdown-line">
            <span>Số lượng thiệp in:</span>
            <strong>{quantity} bộ</strong>
          </div>
          <div className="breakdown-line">
            <span>Quy cách:</span>
            <strong>{shape === 'FLAT' ? 'Khổ đơn phẳng 2 mặt' : 'Khổ gấp đôi Bi-fold'}</strong>
          </div>
          <div className="breakdown-line">
            <span>Đơn giá mỗi bộ hoàn thiện:</span>
            <strong>{unitTotal.toLocaleString('vi-VN')} ₫ / bộ</strong>
          </div>
          <div className="breakdown-line perk-line">
            <span>Trang thiệp số RSVP đồng bộ:</span>
            <span className="perk-badge-free">TẶNG KÈM MIỄN PHÍ</span>
          </div>
        </div>

        <div className="estimator-grand-total">
          <span className="grand-total-label">Tổng dự toán (VND):</span>
          <span className="grand-total-vnd">{grandTotal.toLocaleString('vi-VN')} ₫</span>
        </div>

        <p className="estimator-notice-note">
          * Đơn giá chính xác sẽ được xưởng xác nhận theo file maquette 3D và số lượng cụ thể trong báo giá chính thức.
        </p>

        <a href="/collections" className="estimator-cta-btn">
          Chọn mẫu &amp; Gửi yêu cầu thiết kế ngay &rarr;
        </a>
      </div>
    </div>
  )
}
