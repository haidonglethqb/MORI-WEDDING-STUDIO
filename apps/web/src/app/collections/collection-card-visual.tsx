import { BESPOKE_PROFILES } from './collection-catalog-data'
import { renderCardMotif } from './collection-motif-svgs'
import type { CollectionItem } from './collection-types'

export function CollectionCardVisual({ item }: { item: CollectionItem }) {
  const isBifold = item.shape === 'BIFOLD'
  const profile = BESPOKE_PROFILES[item.slug]
  const silhouette = profile?.silhouette ?? 'standard'
  const cardBg = profile?.cardBg ?? '#fdfcf9'
  const borderColor = profile?.borderColor ?? '#c5a059'
  const accentColor = profile?.accentColor ?? '#b38e46'
  const motifType = profile?.motifType ?? 'arch-vogue'

  return (
    <div className={`card-stage-container stage-theme-${item.categoryId}`}>
      {/* Paper Backing or Envelope Sleeve */}
      {isBifold ? (
        <div className={`stage-bifold-shadow shadow-theme-${item.categoryId}`} />
      ) : (
        <div className={`stage-envelope-backing env-theme-${item.categoryId}`} />
      )}

      {/* Main Artisan Paper Mockup */}
      <div
        className={`stage-artisan-paper silhouette-${silhouette} paper-theme-${item.categoryId} ${isBifold ? 'is-bifold' : 'is-flat'}`}
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
        }}
      >
        {/* Fold crease highlight for Bifold */}
        {isBifold && <div className="bifold-spine-crease" />}

        {/* Vellum translucent sash */}
        {silhouette === 'vellum' && <div className="vellum-paper-overlay" />}

        {/* Corner Ornaments */}
        <span className="corner-pin c-tl" style={{ color: accentColor }}>✦</span>
        <span className="corner-pin c-tr" style={{ color: accentColor }}>✦</span>

        {/* Bespoke SVG Motif & Illustration */}
        <div className="card-bespoke-motif">
          {renderCardMotif(motifType, accentColor)}
        </div>

        {/* Central Typography */}
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

      {/* 3D Action Pill & Category Badge */}
      <span className="visual-3d-tag">✦ Xem 3D</span>
      <span className={`visual-cat-badge badge-theme-${item.categoryId}`}>
        {item.categoryLabel}
      </span>
    </div>
  )
}
