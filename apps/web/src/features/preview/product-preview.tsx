'use client'

import { PreviewStillCard } from './preview-still-card'
import { getProductImageUrl } from './product-image'

interface ProductPreviewProps {
  slug?: string | undefined
  name?: string | undefined
  shape?: string | undefined
  imageUrl?: string | null | undefined
  title?: string | undefined
}

const SHAPE_LABELS: Record<string, string> = {
  BIFOLD: 'Thiệp gấp đôi',
  TRIFOLD: 'Thiệp gấp ba',
  FLAT: 'Thiệp đơn phẳng',
}

export function ProductPreview({
  slug = 'editorial-bifold-01',
  name: _name,
  shape = 'FLAT',
  imageUrl,
  title,
}: ProductPreviewProps) {
  const resolvedImageUrl = imageUrl ?? getProductImageUrl(slug)
  const shapeLabel = SHAPE_LABELS[shape] ?? 'Thiệp giấy mỹ thuật'

  return (
    <div
      className="preview-container"
      style={{ textAlign: 'center', width: '100%', maxWidth: '100%' }}
    >
      <PreviewStillCard slug={slug} imageUrl={resolvedImageUrl} title={title} />
      <p
        style={{
          margin: '12px 0 0',
          fontSize: '12px',
          color: 'var(--a-muted, #62675f)',
          letterSpacing: '0.01em',
        }}
      >
        {shapeLabel} · Chất liệu giấy mỹ thuật bã mía 350gsm
      </p>
    </div>
  )
}
