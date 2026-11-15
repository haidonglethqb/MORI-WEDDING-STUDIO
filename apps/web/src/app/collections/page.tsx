import { HomeFooter } from '../home-footer'
import { HomeNav } from '../home-nav'
import { CartDrawerFallback } from '../../features/cart/cart-drawer-fallback'
import {
  DIGITAL_CATALOG_ITEMS,
  resolveDigitalPriceVnd,
} from '../../features/cart/cart-types'
import { CollectionTabsPanel, type CollectionGroupTab } from './collection-tabs-panel'
import { buildCuratedItem, type CollectionItem } from './collection-types'
import { resolveProductImageUrl } from './product-image-url'
import '../../features/cart/storefront-footer.css'
import './collections.css'
import './masonry-gallery.css'

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
  imageUrl?: string | null
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

function parseTab(raw?: string | string[]): CollectionGroupTab {
  const val = Array.isArray(raw) ? raw[0] : raw
  if (val === 'paper' || val === 'online' || val === 'combo' || val === 'custom') return val
  return 'all'
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  const query = await searchParams
  const products = await loadProducts()

  const paperProducts = products.filter(
    (p) => p.type !== 'DIGITAL' && p.variants.some((v) => v.availability !== 'UNAVAILABLE'),
  )

  const paperItems: CollectionItem[] = paperProducts.map((product) => {
    const orderable = product.variants.filter((v) => v.availability !== 'UNAVAILABLE')
    const shape = orderable[0]?.shape ?? 'FLAT'
    const minPrice = orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd ?? null
    return buildCuratedItem({
      slug: product.slug,
      name: product.name,
      productType: 'PAPER',
      shape,
      minPriceVnd: minPrice,
      isFixture: product.isFixture,
      imageUrl: resolveProductImageUrl(product),
    })
  })

  const digitalItems: CollectionItem[] = DIGITAL_CATALOG_ITEMS.map((meta) => {
    const apiMatch = products.find((p) => p.slug === meta.slug)
    const apiPrice = apiMatch?.variants.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd
    const resolvedPrice = resolveDigitalPriceVnd(meta.slug, apiPrice)
    return buildCuratedItem({
      slug: meta.slug,
      name: apiMatch?.name ?? meta.name,
      productType: 'DIGITAL',
      shape: 'DIGITAL',
      minPriceVnd: String(resolvedPrice),
      isFixture: false,
      imageUrl: null,
    })
  })

  const comboPaperOptions = paperItems.map((item) => ({
    slug: item.slug,
    name: item.curatedTitle,
    shape: item.shape,
    unitAmountVnd: item.minPriceVnd ? Number(item.minPriceVnd) : 9_000,
    imageUrl: item.imageUrl,
  }))

  const comboDigitalOptions = digitalItems.map((item) => ({
    slug: item.slug,
    name: item.curatedTitle,
    unitAmountVnd: item.minPriceVnd ? Number(item.minPriceVnd) : 499_000,
  }))

  const calculatorOptions = paperProducts.flatMap((product) =>
    product.variants
      .filter((variant) => variant.availability !== 'UNAVAILABLE' && variant.shape !== 'TRIFOLD')
      .map((variant) => ({
        id: variant.id,
        label: `${product.name} · ${variant.shape === 'BIFOLD' ? 'Gấp đôi' : 'Phẳng'}`,
        isFixture: product.isFixture,
      })),
  )

  return (
    <>
      <HomeNav />
      <main className="collections-wrap">
        <header className="collections-header">
          <span className="collections-tag">BỘ SƯU TẬP MORI</span>
          <h1>Bộ sưu tập Thiệp cưới &amp; Thiệp Online</h1>
          <p>
            Khám phá 4 giải pháp tại MORI: Thiệp cưới vật lý trên giấy mỹ thuật 350gsm, Thiệp online website riêng, Combo tiết kiệm 50% và Gói thiết kế riêng theo câu chuyện hai bạn.
          </p>
        </header>

        <CollectionTabsPanel
          paperItems={paperItems}
          digitalItems={digitalItems}
          calculatorOptions={calculatorOptions}
          comboPaperOptions={comboPaperOptions}
          comboDigitalOptions={comboDigitalOptions}
          initialTab={parseTab(query.tab)}
        />
      </main>
      <CartDrawerFallback />
      <HomeFooter />
    </>
  )
}
