'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBespokeProfile } from '../collections/collection-catalog-data'
import { renderCardMotif } from '../collections/collection-motif-svgs'
import { resolveSampleCouple } from '../collections/collection-types'
import { ProductPreview } from '../../features/preview/product-preview'
import type { SuggestedProductCard } from './assistant-types'

interface ProductCardProps {
  item: SuggestedProductCard
}

const SILHOUETTE_MAP: Record<string, string> = {
  arch: 'Dáng vòm Arch',
  deckle: 'Mép xé Deckle',
  vellum: 'Bìa can Vellum',
  standard: 'Chữ nhật cổ điển',
}

export function AssistantProductCard({ item }: ProductCardProps) {
  const [show3D, setShow3D] = useState(false)
  const profile = getBespokeProfile(item.slug)
  const title = profile?.title ?? item.title ?? item.name
  const subtitle = profile?.subtitle ?? item.subtitle ?? 'Chế tác giấy bã mía 350gsm'
  const silhouetteLabel = profile?.silhouette ? SILHOUETTE_MAP[profile.silhouette] : null

  const cardBg = profile?.cardBg ?? '#fdfcf9'
  const isDark = cardBg.startsWith('#6') || cardBg.startsWith('#7') || cardBg.startsWith('#8')
  const borderColor = profile?.borderColor ?? '#c5a059'
  const accentColor = profile?.accentColor ?? '#b38e46'
  const motifType = profile?.motifType ?? 'arch-vogue'
  const coupleName = resolveSampleCouple(item.slug)
  const textColor = isDark ? '#fbf8ee' : '#222820'

  const displayPrice = item.startingPriceVnd.includes('₫')
    ? item.startingPriceVnd
    : `${item.startingPriceVnd} ₫`

  return (
    <div className="embedded-product-card">
      <div className="embedded-product-header">
        <span className="collection-kicker">Bộ sưu tập MORI</span>
        {silhouetteLabel && <span className="silhouette-badge">{silhouetteLabel}</span>}
      </div>

      {/* Visual In-Chat Card Mockup Preview */}
      <div className="card-mockup-stage" onClick={() => setShow3D(!show3D)} role="button" tabIndex={0}>
        <div
          className={`mini-artisan-paper ${isDark ? 'is-dark' : 'is-light'}`}
          style={{
            backgroundColor: cardBg,
            borderColor,
            color: textColor,
          }}
        >
          <div className="mini-motif-box">{renderCardMotif(motifType, accentColor)}</div>
          <div className="mini-paper-typography">
            <span className="mini-couple-title" style={{ color: textColor }}>
              {coupleName}
            </span>
            <span className="mini-date-subtitle" style={{ color: isDark ? '#dfd5be' : '#71786c' }}>
              12 Tháng 12, 2026
            </span>
            <div className="mini-divider-line" style={{ background: accentColor }} />
            <span className="mini-tagline" style={{ color: accentColor }}>
              {isDark ? 'TRĂM NĂM HẠNH PHÚC' : 'SAVE THE DATE'}
            </span>
          </div>
          <span className="mini-preview-overlay-hint">
            {show3D ? '✕ Đóng 3D' : '✦ Bấm để xoay 3D'}
          </span>
        </div>
      </div>

      <h4 className="embedded-product-title">{title}</h4>
      <p className="embedded-product-subtitle">{subtitle}</p>

      {/* Interactive 3D Viewer in Chat */}
      {show3D && (
        <div className="inline-3d-scene-box">
          <div className="inline-3d-header">
            <span className="inline-3d-label">✦ 3D Studio Trực Tiếp</span>
            <button
              type="button"
              className="inline-3d-close-btn"
              onClick={() => setShow3D(false)}
            >
              ✕ Thu gọn
            </button>
          </div>
          <ProductPreview slug={item.slug} name={coupleName} shape={item.shape} />
        </div>
      )}

      <div className="embedded-product-footer">
        <div className="embedded-product-price">
          <span className="price-label">Giá khởi điểm</span>
          <span className="price-value">{displayPrice}</span>
        </div>

        <div className="embedded-product-actions">
          <button
            type="button"
            className={`embedded-preview-3d-btn ${show3D ? 'active' : ''}`}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? '✕ Đóng 3D' : '✦ Xem 3D tại đây'}
          </button>
          <Link href={`/products/${item.slug}`} className="embedded-product-action">
            Mở Studio &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
