import './collections.css'

export const dynamic = 'force-dynamic'

interface CatalogueVariant {
  id: string
  shape: 'FLAT' | 'BIFOLD' | 'TRIFOLD'
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'QUOTE_REQUIRED'
  unitAmountVnd: string | null
}

interface CatalogueProduct {
  slug: string
  name: string
  isFixture: boolean
  variants: CatalogueVariant[]
}

const shapeLabel = { FLAT: 'Thiệp phẳng', BIFOLD: 'Thiệp gấp đôi', TRIFOLD: 'Gấp ba' }

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

async function loadProducts(): Promise<CatalogueProduct[]> {
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/catalog/products`, { cache: 'no-store' })
    if (!response.ok) return []
    return (await response.json()) as CatalogueProduct[]
  } catch {
    return []
  }
}

export default async function CollectionsPage() {
  const products = await loadProducts()

  return (
    <main className="collections">
      <h1>Bộ sưu tập</h1>
      {products.length === 0 ? <p>Chưa có mẫu nào đang bán.</p> : null}
      <ul>
        {products.map((product) => (
          <li key={product.slug}>
            <h2>{product.name}</h2>
            {product.isFixture ? <p>Mẫu thử</p> : null}
            <ul>
              {product.variants
                .filter((variant) => variant.availability !== 'UNAVAILABLE')
                .map((variant) => (
                  <li key={variant.id}>
                    <span>{shapeLabel[variant.shape]}</span>
                    <span>
                      {variant.unitAmountVnd === null
                        ? 'Cần báo giá studio'
                        : `${variant.unitAmountVnd} VND`}
                    </span>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  )
}
