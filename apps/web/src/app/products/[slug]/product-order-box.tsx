'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addToCart, openCartDrawer, readSelectedFont } from '../../../features/cart/cart-store'
import {
  DIGITAL_CATALOG_ITEMS,
  formatVnd,
  type DigitalTemplateMeta,
} from '../../../features/cart/cart-types'
import { getShapeLabel } from './product-copy'

export interface OrderVariantOption {
  shape: string
  unitAmountVnd: string | null
}

interface ProductOrderBoxProps {
  slug: string
  title: string
  productType: 'PAPER' | 'DIGITAL'
  imageUrl: string | null
  variants: OrderVariantOption[]
  digitalPriceVnd?: number | undefined
  digitalOptions?: readonly DigitalTemplateMeta[] | undefined
  isFixture: boolean
}

const PRESET_QUANTITIES = ['100', '150', '200', '300', '500'] as const

export function ProductOrderBox({
  slug,
  title,
  productType,
  imageUrl,
  variants,
  digitalPriceVnd = 499_000,
  digitalOptions = DIGITAL_CATALOG_ITEMS,
  isFixture,
}: ProductOrderBoxProps) {
  const isDigital = productType === 'DIGITAL'
  const [selectedShape, setSelectedShape] = useState(variants[0]?.shape ?? (isDigital ? 'DIGITAL' : 'FLAT'))
  const [quantityMode, setQuantityMode] = useState<string>(isDigital ? '1' : '150')
  const [customQty, setCustomQty] = useState<string>('250')
  const [includeCombo, setIncludeCombo] = useState(false)
  const [comboDigitalSlug, setComboDigitalSlug] = useState(digitalOptions[0]?.slug ?? 'minimalist-digital-01')
  const [fontInfo, setFontInfo] = useState<{ code: string; name: string } | null>(null)

  useEffect(() => {
    setFontInfo(readSelectedFont())
  }, [])

  const activeVariant = variants.find((v) => v.shape === selectedShape) ?? variants[0]
  const unitVnd = isDigital ? digitalPriceVnd : activeVariant?.unitAmountVnd ? Number(activeVariant.unitAmountVnd) : 9_000
  const effectiveQty = isDigital
    ? 1
    : quantityMode === 'CUSTOM'
      ? Math.max(1, Math.min(10000, Math.round(Number(customQty) || 100)))
      : Number(quantityMode)
  const selectedDigital = digitalOptions.find((item) => item.slug === comboDigitalSlug) ?? digitalOptions[0]
  const comboDigitalDiscounted = selectedDigital ? Math.round(selectedDigital.unitAmountVnd * 0.5) : 0
  const estimatedTotal = isDigital ? unitVnd : unitVnd * effectiveQty + (includeCombo ? comboDigitalDiscounted : 0)

  function handlePlaceInCart() {
    if (!isDigital && includeCombo && selectedDigital) {
      addToCart({
        slug,
        name: title,
        productType: 'COMBO',
        shape: selectedShape,
        quantity: effectiveQty,
        unitAmountVnd: unitVnd,
        imageUrl,
        linkedDigitalSlug: selectedDigital.slug,
        linkedDigitalName: selectedDigital.name,
        linkedDigitalUnitVnd: selectedDigital.unitAmountVnd,
        fontCode: fontInfo?.code,
      })
    } else {
      addToCart({
        slug,
        name: title,
        productType: isDigital ? 'DIGITAL' : 'PAPER',
        shape: isDigital ? 'DIGITAL' : selectedShape,
        quantity: effectiveQty,
        unitAmountVnd: unitVnd,
        imageUrl,
        fontCode: fontInfo?.code,
      })
    }
    openCartDrawer()
  }

  return (
    <div className="product-order-box">
      {!isDigital && variants.length > 0 ? (
        <div className="order-box-field">
          <label htmlFor="product-shape-select">Quy cách thiệp:</label>
          <select id="product-shape-select" value={selectedShape} onChange={(e) => setSelectedShape(e.target.value)}>
            {variants.map((variant) => (
              <option key={variant.shape} value={variant.shape}>
                {getShapeLabel(variant.shape)}
                {variant.unitAmountVnd ? ` · ${formatVnd(Number(variant.unitAmountVnd))}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!isDigital ? (
        <div className="order-box-field">
          <label htmlFor="product-qty-select">Chọn số lượng thiệp:</label>
          <select id="product-qty-select" value={quantityMode} onChange={(e) => setQuantityMode(e.target.value)}>
            {PRESET_QUANTITIES.map((qty) => (
              <option key={qty} value={qty}>{qty} bộ thiệp</option>
            ))}
            <option value="CUSTOM">Nhập số lượng tùy chọn...</option>
          </select>
          {quantityMode === 'CUSTOM' ? (
            <input type="number" min="1" max="10000" value={customQty} onChange={(e) => setCustomQty(e.target.value)} aria-label="Số lượng thiệp tùy chọn" placeholder="Nhập số bộ thiệp (1 - 10.000)" />
          ) : null}
        </div>
      ) : (
        <div className="order-box-field">
          <label>Gói sản phẩm:</label>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#3b4822' }}>
            1 gói Website thiệp cưới online · {formatVnd(unitVnd)}
          </div>
        </div>
      )}

      {!isDigital ? (
        <>
          <label className="order-combo-toggle">
            <input type="checkbox" checked={includeCombo} onChange={(e) => setIncludeCombo(e.target.checked)} />
            <span>
              <strong>Mua kèm Thiệp Online</strong> (Combo giảm 50% giá thiệp online)
              <span className="combo-discount-tag">-50%</span>
            </span>
          </label>
          {includeCombo ? (
            <div className="order-box-field">
              <label htmlFor="combo-online-select">Chọn mẫu thiệp online đi kèm:</label>
              <select id="combo-online-select" value={comboDigitalSlug} onChange={(e) => setComboDigitalSlug(e.target.value)}>
                {digitalOptions.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name} · Gốc {formatVnd(item.unitAmountVnd)} → {formatVnd(Math.round(item.unitAmountVnd * 0.5))}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="order-font-note">
        <span>{fontInfo ? `Font đã chọn: ${fontInfo.name} (${fontInfo.code})` : 'Chưa chọn font chữ riêng'}</span>
        <Link href="/fonts">Chọn font chữ →</Link>
      </div>

      <div className="order-total-bar">
        <span>{isFixture ? 'Tạm tính tham khảo' : 'Tạm tính'}</span>
        <strong>{formatVnd(estimatedTotal)}</strong>
      </div>

      <button type="button" className="product-order-submit" onClick={handlePlaceInCart}>ĐẶT THIỆP</button>
      <div className="product-order-hint">
        <strong>Gợi ý cho bạn:</strong>
        <span>- Mẫu thông tin cần điền để in lên Thiệp cưới (bạn có thể thực hiện việc này sau khi hoàn tất đặt hàng.)</span>
      </div>
    </div>
  )
}
