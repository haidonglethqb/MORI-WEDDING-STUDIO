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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <span
          className="product-category-badge"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '999px',
            background: '#faf4eb',
            color: cat?.accentColor ?? '#926b1c',
            border: `1px solid ${cat?.accentColor ?? '#d4af37'}40`,
          }}
        >
          {cat?.icon} {cat?.title.replace('Bộ sưu tập ', '')} · {cat?.badge}
        </span>
        {isFixture && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '999px',
              background: '#f4f6f2',
              color: '#55634f',
            }}
          >
            Mẫu trưng bày atelier
          </span>
        )}
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-serif, "Lora", Georgia, serif)',
          fontSize: '36px',
          fontWeight: 600,
          color: '#222820',
          margin: '0 0 10px',
          letterSpacing: '-0.01em',
          lineHeight: '1.25',
        }}
      >
        {curatedTitle}
      </h1>

      {curatedSubtitle && (
        <p
          style={{
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#70776a',
            margin: '0 0 8px',
            lineHeight: '1.5',
          }}
        >
          {curatedSubtitle}
        </p>
      )}

      <span
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#9ba295',
          display: 'inline-block',
          marginBottom: '16px',
        }}
      >
        Mã tác phẩm xưởng: {slug} ({rawName})
      </span>
    </header>
  )
}
