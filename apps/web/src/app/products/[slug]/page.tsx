import { notFound } from 'next/navigation'
import { ProductPreview } from '../../../features/preview/product-preview'
import './product.css'

export const dynamic = 'force-dynamic'

interface CatalogueVariant {
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'QUOTE_REQUIRED'
  unitAmountVnd: string | null
  shape: string
}

interface CatalogueProduct {
  slug: string
  name: string
  isFixture: boolean
  variants: CatalogueVariant[]
}

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await loadProducts()
  const product = products.find((item) => item.slug === slug)
  if (!product) notFound()
  const orderable = product.variants.filter((variant) => variant.availability !== 'UNAVAILABLE')

  return (
    <main className="product">
      <h1>{product.name}</h1>
      {product.isFixture ? <p>Mẫu thử</p> : null}
      <ul>
        {orderable.map((variant) => (
          <li key={variant.shape}>
            {variant.unitAmountVnd === null ? 'Cần báo giá studio' : `${variant.unitAmountVnd} VND`}
          </li>
        ))}
      </ul>
      <ProductPreview name={product.name} shape={orderable[0]?.shape ?? 'FLAT'} />
    </main>
  )
}
