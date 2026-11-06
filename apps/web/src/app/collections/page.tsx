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
    .map((product) => {
      const orderable = product.variants.filter((v) => v.availability !== 'UNAVAILABLE')
      const shape = orderable[0]?.shape ?? 'FLAT'
      const minPrice = orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd ?? null

      return buildCuratedItem(
        {
          slug: product.slug,
          name: product.name,
          shape,
          minPriceVnd: minPrice,
          isFixture: product.isFixture,
        },
      )
    })

  return (
    <>
      <HomeNav />
      <main className="collections-wrap">
        <header className="collections-header">
          <span className="collections-tag">BỘ SƯU TẬP MORI</span>
          <h1>Bộ sưu tập Thiệp cưới Nghệ nhân</h1>
          <p>
            Khám phá các hướng thiết kế và chọn mẫu để bắt đầu trao đổi cùng xưởng.
          </p>
          {items.some((item) => item.isFixture) ? (
            <p className="catalogue-note">Một số mẫu đang là nội dung minh họa. Giá và quy cách thực tế sẽ được xác nhận trước khi bạn gửi yêu cầu.</p>
          ) : null}
        </header>

        <CollectionFilters items={items} />
      </main>
    </>
  )
}
