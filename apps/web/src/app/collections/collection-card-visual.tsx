'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BESPOKE_PROFILES, resolveProductImageUrl } from './collection-catalog-data'
import { renderCardMotif } from './collection-motif-svgs'
import type { CollectionItem } from './collection-types'

export function CollectionCardVisual({ item }: { item: CollectionItem }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imageUrl = resolveProductImageUrl(item)
  const showPhoto = Boolean(imageUrl) && !imgFailed

  const isBifold = item.shape === 'BIFOLD'
  const profile = BESPOKE_PROFILES[item.slug]
  const silhouette = profile?.silhouette ?? 'standard'
  const cardBg = profile?.cardBg ?? '#fdfcf9'
  const borderColor = profile?.borderColor ?? '#c5a059'
  const accentColor = profile?.accentColor ?? '#b38e46'
  const motifType = profile?.motifType ?? 'arch-vogue'

  return (
    <div
      className={`card-stage-container stage-theme-${item.categoryId} ${showPhoto ? 'has-photo' : ''}`}
    >
      {showPhoto && imageUrl ? (
        <div className="card-photo-frame">
          <Image
            src={imageUrl}
            alt={item.curatedTitle}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
            className="card-product-photo"
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <>
          {isBifold ? (
            <div className={`stage-bifold-shadow shadow-theme-${item.categoryId}`} />
          ) : (
            <div className={`stage-envelope-backing env-theme-${item.categoryId}`} />
          )}

          <div
            className={`stage-artisan-paper silhouette-${silhouette} paper-theme-${item.categoryId} ${isBifold ? 'is-bifold' : 'is-flat'}`}
            style={{ backgroundColor: cardBg, borderColor }}
          >
            {isBifold && <div className="bifold-spine-crease" />}
            {silhouette === 'vellum' && <div className="vellum-paper-overlay" />}

            <span className="corner-pin c-tl" style={{ color: accentColor }}>✦</span>
            <span className="corner-pin c-tr" style={{ color: accentColor }}>✦</span>

            <div className="card-bespoke-motif">
              {renderCardMotif(motifType, accentColor)}
            </div>

            <div className="paper-text-center">
              <h4 className="stage-couple-names">Tên cặp đôi</h4>
              <p className="stage-date-text">Ngày tổ chức</p>
              <div className="stage-ornament-divider" style={{ background: accentColor }} />
              <span className="stage-save-date" style={{ color: accentColor }}>
                {item.categoryId === 'heritage' ? 'TRĂM NĂM HẠNH PHÚC' : 'SAVE THE DATE'}
              </span>
            </div>

            <span className="corner-pin c-bl" style={{ color: accentColor }}>✦</span>
            <span className="corner-pin c-br" style={{ color: accentColor }}>✦</span>
          </div>
        </>
      )}

      <span className="visual-3d-tag">✦ Xem 3D</span>
      <span className={`visual-cat-badge badge-theme-${item.categoryId}`}>
        {item.categoryLabel}
      </span>
    </div>
  )
}
