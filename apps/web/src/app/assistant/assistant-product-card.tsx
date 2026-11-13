'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getBespokeProfile, resolveProductImageUrl } from '../collections/collection-catalog-data'
import { renderCardMotif } from '../collections/collection-motif-svgs'
import { getPreviewCoupleName } from '../collections/collection-types'
import { ProductPreview } from '../../features/preview/product-preview'
import type { SuggestedProductCard } from './assistant-types'
import { MoriIcon } from '../../components/mori-icon'
import './assistant-product-card.css'

interface ProductCardProps {
  item: SuggestedProductCard
}

const SILHOUETTE_MAP: Record<string, string> = {
  arch: 'Dáng vòm Arch',
  deckle: 'Mép xé Deckle',
  vellum: 'Bìa can Vellum',
  standard: 'Chữ nhật cổ điển',
}

function formatStartingPrice(raw: string, isFixture: boolean): string {
  if (isFixture) return 'Mẫu minh họa'
  const trimmed = raw.trim()
  if (!trimmed || trimmed === '0') return 'Báo giá theo yêu cầu'
  if (/^\d+$/.test(trimmed)) return `${BigInt(trimmed).toLocaleString('vi-VN')} ₫`
  return trimmed
}

export function AssistantProductCard({ item }: ProductCardProps) {
  const [show3D, setShow3D] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const profile = getBespokeProfile(item.slug)
  const imageUrl = resolveProductImageUrl(item)
  const showPhoto = Boolean(imageUrl) && !imgFailed
  const isFixture = item.isFixture === true

  const title = profile?.title ?? item.title ?? item.name
  const subtitle = isFixture
    ? 'Mẫu minh họa; thông tin sản phẩm thực tế đang được cập nhật.'
    : item.subtitle || profile?.subtitle || 'Thiệp cưới in trên giấy ngà sinh thái tại xưởng MORI.'
  const silhouetteLabel = profile?.silhouette ? SILHOUETTE_MAP[profile.silhouette] : null

  const cardBg = profile?.cardBg ?? '#fdfcf9'
  const isDark = cardBg.startsWith('#6') || cardBg.startsWith('#7') || cardBg.startsWith('#8')
  const borderColor = profile?.borderColor ?? '#c5a059'
  const accentColor = profile?.accentColor ?? '#b38e46'
  const motifType = profile?.motifType ?? 'arch-vogue'
  const coupleName = getPreviewCoupleName()
  const textColor = isDark ? '#fbf8ee' : '#222820'
  const displayPrice = formatStartingPrice(item.startingPriceVnd, isFixture)

  return (
    <div className="embedded-product-card">
      <div className="embedded-product-header">
        <span className="collection-kicker">Bộ sưu tập MORI</span>
        {silhouetteLabel && <span className="silhouette-badge">{silhouetteLabel}</span>}
      </div>

      {showPhoto && imageUrl ? (
        <div className="assistant-card-photo-stage">
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 320px"
            className="assistant-card-photo"
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <div className="card-mockup-stage" aria-label="Phối cảnh thiệp">
          <div
            className={`mini-artisan-paper ${isDark ? 'is-dark' : 'is-light'}`}
            style={{ backgroundColor: cardBg, borderColor, color: textColor }}
          >
            <div className="mini-motif-box">{renderCardMotif(motifType, accentColor)}</div>
            <div className="mini-paper-typography">
              <span className="mini-couple-title" style={{ color: textColor }}>Tên hai bạn</span>
              <span className="mini-date-subtitle" style={{ color: isDark ? '#dfd5be' : '#71786c' }}>
                Ngày tổ chức
              </span>
              <div className="mini-divider-line" style={{ background: accentColor }} />
              <span className="mini-tagline" style={{ color: accentColor }}>
                {isDark ? 'TRĂM NĂM HẠNH PHÚC' : 'SAVE THE DATE'}
              </span>
            </div>
          </div>
        </div>
      )}

      <h4 className="embedded-product-title">{title}</h4>
      <p className="embedded-product-subtitle">{subtitle}</p>

      {show3D && (
        <div className="inline-3d-scene-box">
          <div className="inline-3d-header">
            <span className="inline-3d-label">Xem trước 3D</span>
            <button
              type="button"
              className="inline-3d-close-btn"
              aria-label="Thu gọn phối cảnh 3D"
              onClick={() => setShow3D(false)}
            >
              Thu gọn
            </button>
          </div>
          <ProductPreview slug={item.slug} name={coupleName} shape={item.shape} />
        </div>
      )}

      <div className="embedded-product-footer">
        <div className="embedded-product-price">
          <span className="price-label">{isFixture ? 'Giá và quy cách' : 'Giá tham khảo'}</span>
          <span className="price-value">{displayPrice}</span>
        </div>

        <div className="embedded-product-actions">
          <button
            type="button"
            className={`embedded-preview-3d-btn ${show3D ? 'active' : ''}`}
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? 'Đóng xem trước' : <><MoriIcon name="paper" /> Xem trước 3D</>}
          </button>
          <Link href={`/products/${item.slug}`} className="embedded-product-action">
            Xem mẫu <MoriIcon name="arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  )
}
