'use client'

import { getBespokeProfile } from '../../app/collections/collection-catalog-data'
import { renderCardMotif } from '../../app/collections/collection-motif-svgs'
import { getPreviewCoupleName } from '../../app/collections/collection-types'

export function PreviewStillCard({ slug }: { slug: string }) {
  const profile = getBespokeProfile(slug)
  const cardBg = profile?.cardBg ?? '#fdfbf7'
  const isDark = cardBg.startsWith('#6') || cardBg.startsWith('#7') || cardBg.startsWith('#8')
  const borderColor = profile?.borderColor ?? '#b8944d'
  const accentColor = profile?.accentColor ?? '#b8944d'
  const coupleName = getPreviewCoupleName()
  const textColor = isDark ? '#fbf8ee' : '#222820'
  const motifType = profile?.motifType ?? 'arch-vogue'

  return (
    <div style={{ padding: '28px', background: '#fdfbf7', borderRadius: '14px', border: '1px solid rgba(85,99,79,0.15)' }}>
      <div
        style={{
          maxWidth: '280px',
          margin: '0 auto',
          padding: '36px 20px',
          border: `1px solid ${borderColor}`,
          background: cardBg,
          borderRadius: '4px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          color: textColor,
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '4px', color: accentColor, display: 'block', marginBottom: '16px' }}>
          MORI ATELIER
        </span>

        <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
          {renderCardMotif(motifType, accentColor)}
        </div>

        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '20px', color: textColor, margin: '0 0 8px' }}>
          {coupleName}
        </h3>

        <p style={{ fontSize: '12px', color: isDark ? '#e0d4be' : '#6a7166', margin: '0 0 16px' }}>
          12 Tháng 12, 2026 · Hà Nội
        </p>

        <div style={{ borderTop: `1px solid ${borderColor}`, width: '60px', margin: '0 auto 12px' }} />

        <span style={{ fontSize: '10px', color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
          {isDark ? 'Trăm Năm Hạnh Phúc' : 'Save The Date'}
        </span>

        <span style={{ fontSize: '10px', color: isDark ? '#bfae93' : '#999', fontStyle: 'italic' }}>
          Giấy bã mía sinh thái 350gsm
        </span>
      </div>
    </div>
  )
}
