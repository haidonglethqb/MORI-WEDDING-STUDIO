import {
  COLLECTION_CATEGORIES,
  resolveCategoryId,
} from '../../collections/collection-types'

interface ProductMetaHeaderProps {
  slug: string
  rawName: string
  curatedTitle: string
  curatedSubtitle?: string | undefined
  isFixture?: boolean | undefined
}

export function ProductMetaHeader({
  slug,
  rawName,
  curatedTitle,
  curatedSubtitle,
  isFixture,
}: ProductMetaHeaderProps) {
  const categoryId = resolveCategoryId(slug)
  const cat = COLLECTION_CATEGORIES.find((c) => c.id === categoryId)

  return (
    <header className="product-meta-header" style={{ marginBottom: '18px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span
          className="product-category-badge"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '99px',
            background: 'var(--a-paper, #f3f0e8)',
            color: cat?.accentColor ?? 'var(--a-amber-text, #8f5420)',
            border: `1px solid ${cat?.accentColor ?? '#cbc3b2'}40`,
          }}
        >
          {cat?.title.replace('Bộ sưu tập ', '')} · {cat?.badge}
        </span>
        {isFixture === true && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '99px',
              background: '#f6ead8',
              color: '#8a521d',
            }}
          >
            Mẫu minh họa
          </span>
        )}
      </div>

      <h1
        style={{
          fontFamily: 'var(--a-display, "Lora", Georgia, serif)',
          fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 500,
          color: 'var(--a-text, #1d221e)',
          margin: '0 0 10px',
          letterSpacing: '-0.02em',
          lineHeight: '1.15',
          overflowWrap: 'anywhere',
        }}
      >
        {curatedTitle}
      </h1>

      {curatedSubtitle && (
        <p
          style={{
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'var(--a-muted, #62675f)',
            margin: '0 0 10px',
            lineHeight: '1.6',
          }}
        >
          {curatedSubtitle}
        </p>
      )}

      <span
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--a-muted, #62675f)',
          display: 'inline-block',
          marginBottom: '12px',
          overflowWrap: 'anywhere',
        }}
      >
        Mã tác phẩm xưởng: {slug}
        {rawName && rawName !== curatedTitle ? ` (${rawName})` : ''}
      </span>
    </header>
  )
}
