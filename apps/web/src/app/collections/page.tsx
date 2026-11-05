import { HomeNav } from '../home-nav'
import { CollectionFilters } from './collection-filters'
import { buildCuratedItem, type CollectionItem } from './collection-types'
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
  type?: 'PAPER' | 'DIGITAL'
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

export default async function CollectionsPage() {
  const products = await loadProducts()

  const items: CollectionItem[] = products
    .filter((p) => p.variants.some((v) => v.availability !== 'UNAVAILABLE'))
    .map((product, idx) => {
      const orderable = product.variants.filter((v) => v.availability !== 'UNAVAILABLE')
      const bifold = orderable.some((v) => v.shape === 'BIFOLD')
      const minPrice = orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd ?? '25000'

      return buildCuratedItem(
        {
          slug: product.slug,
          name: product.name,
          shape: bifold ? 'BIFOLD' : 'FLAT',
          minPriceVnd: minPrice,
        },
        idx,
      )
    })

  return (
    <>
      <HomeNav />
      <main className="collections-wrap">
        <header className="collections-header">
          <span className="collections-tag">Atelier Catalogue 2026</span>
          <h1>Bộ sưu tập Thiệp cưới Nghệ nhân</h1>
          <p>
            Tuyển tập 5 phong cách cưới độc bản: Editorial Vogue, Floral Thảo mộc, Heritage Hoàng Kim,
            Minimalist Wabi-Sabi và Modern Calligraphy — in trên giấy bã mía sinh thái 350gsm.
          </p>
        </header>

        <CollectionFilters items={items} />
      </main>
    </>
  )
}
