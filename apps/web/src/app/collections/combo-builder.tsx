'use client'

import { useState } from 'react'
import { addToCart, openCartDrawer, readSelectedFont } from '../../features/cart/cart-store'
import { DIGITAL_CATALOG_ITEMS, formatShapeLabel, formatVnd } from '../../features/cart/cart-types'

export interface ComboPaperOption {
  slug: string
  name: string
  shape: string
  unitAmountVnd: number
  imageUrl: string | null
}

export interface ComboDigitalOption {
  slug: string
  name: string
  unitAmountVnd: number
}

interface ComboBuilderProps {
  paperOptions: ComboPaperOption[]
  digitalOptions?: ComboDigitalOption[] | undefined
}

const QUANTITIES = [100, 150, 200, 300, 500] as const

export function ComboBuilder({ paperOptions, digitalOptions }: ComboBuilderProps) {
  const availableDigital: ComboDigitalOption[] =
    digitalOptions && digitalOptions.length > 0
      ? digitalOptions
      : DIGITAL_CATALOG_ITEMS.map((item) => ({
          slug: item.slug,
          name: item.name,
          unitAmountVnd: item.unitAmountVnd,
        }))

  const [paperSlug, setPaperSlug] = useState(paperOptions[0]?.slug ?? '')
  const [digitalSlug, setDigitalSlug] = useState(availableDigital[0]?.slug ?? '')
  const [quantity, setQuantity] = useState<number>(150)

  const selectedPaper = paperOptions.find((item) => item.slug === paperSlug) ?? paperOptions[0]
  const selectedDigital =
    availableDigital.find((item) => item.slug === digitalSlug) ?? availableDigital[0]

  const paperTotal = selectedPaper ? selectedPaper.unitAmountVnd * quantity : 0
  const digitalOriginal = selectedDigital?.unitAmountVnd ?? 0
  const digitalDiscounted = Math.round(digitalOriginal * 0.5)
  const savedVnd = digitalOriginal - digitalDiscounted
  const grandTotal = paperTotal + digitalDiscounted

  function handleAddCombo() {
    if (!selectedPaper || !selectedDigital) return
    const selectedFont = readSelectedFont()
    addToCart({
      slug: selectedPaper.slug,
      name: selectedPaper.name,
      productType: 'COMBO',
      shape: selectedPaper.shape,
      quantity,
      unitAmountVnd: selectedPaper.unitAmountVnd,
      imageUrl: selectedPaper.imageUrl,
      linkedDigitalSlug: selectedDigital.slug,
      linkedDigitalName: selectedDigital.name,
      linkedDigitalUnitVnd: digitalOriginal,
      fontCode: selectedFont?.code,
    })
    openCartDrawer()
  }

  return (
    <section className="group-section-wrap" id="combo-thiep">
      <div className="group-section-head">
        <span className="group-eyebrow">Nhóm 3 · Combo Tiết Kiệm</span>
        <h2>Combo thiệp cưới — Giảm 50% Thiệp Online khi đặt kèm thiệp giấy</h2>
        <p className="group-section-desc">
          Kết hợp 1 mẫu thiệp cưới vật lý in giấy mỹ thuật 350gsm và 1 website thiệp online đồng bộ phong cách để nhận ngay ưu đãi giảm 50% gói thiệp online.
        </p>
      </div>

      <div className="combo-builder-grid">
        <div className="combo-card">
          <div className="combo-field">
            <label htmlFor="combo-paper-select">1. Chọn mẫu thiệp cưới vật lý</label>
            <select
              id="combo-paper-select"
              value={selectedPaper?.slug ?? ''}
              onChange={(event) => setPaperSlug(event.target.value)}
            >
              {paperOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name} ({formatShapeLabel(option.shape)}) · {formatVnd(option.unitAmountVnd)}/thiệp
                </option>
              ))}
            </select>
          </div>

          <div className="combo-field">
            <label>2. Chọn số lượng bộ thiệp</label>
            <div className="combo-qty-pills">
              {QUANTITIES.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  className={`combo-qty-pill ${quantity === qty ? 'active' : ''}`}
                  onClick={() => setQuantity(qty)}
                >
                  {qty} bộ
                </button>
              ))}
            </div>
          </div>

          <div className="combo-field">
            <label htmlFor="combo-digital-select">3. Chọn mẫu thiệp online đi kèm (-50%)</label>
            <select
              id="combo-digital-select"
              value={selectedDigital?.slug ?? ''}
              onChange={(event) => setDigitalSlug(event.target.value)}
            >
              {availableDigital.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name} · Gốc {formatVnd(option.unitAmountVnd)} → Còn{' '}
                  {formatVnd(Math.round(option.unitAmountVnd * 0.5))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="combo-summary-card">
          <h3>Bảng tính Combo của bạn</h3>
          <div className="combo-line-row">
            <span>
              Thiệp giấy: {selectedPaper?.name ?? '—'} × {quantity} bộ
            </span>
            <strong>{formatVnd(paperTotal)}</strong>
          </div>
          <div className="combo-line-row">
            <span>Thiệp online: {selectedDigital?.name ?? '—'}</span>
            <span>
              <span className="combo-strike">{formatVnd(digitalOriginal)}</span>
              <strong>{formatVnd(digitalDiscounted)}</strong>
            </span>
          </div>
          <div className="combo-saving-pill">
            <span>Tiết kiệm ưu đãi Combo 50%</span>
            <span>-{formatVnd(savedVnd)}</span>
          </div>
          <div className="combo-total-row">
            <span>Tổng tiền Combo</span>
            <strong>{formatVnd(grandTotal)}</strong>
          </div>
          <button
            type="button"
            className="combo-cta-btn"
            disabled={!selectedPaper || !selectedDigital}
            onClick={handleAddCombo}
          >
            Thêm Combo vào giỏ hàng
          </button>
        </div>
      </div>
    </section>
  )
}
