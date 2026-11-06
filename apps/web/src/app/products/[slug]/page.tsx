import { notFound } from 'next/navigation'
import { HomeNav } from '../../home-nav'
import { ProductPreview } from '../../../features/preview/product-preview'
import { getBespokeProfile } from '../../collections/collection-catalog-data'
import {
  COLLECTION_CATEGORIES,
  resolveCategoryId,
  getPreviewCoupleName,
} from '../../collections/collection-types'
import { ProductMetaHeader } from './product-meta-header'
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

const shapeLabel: Record<string, string> = {
  FLAT: 'Dạng phẳng (Flat Card)',
  BIFOLD: 'Dạng gập đôi (Bi-fold)',
  ARCH: 'Dạng vòm uốn cong (Arch)',
  DECKLE: 'Mép xé thủ công (Deckle Edge)',
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
  let product = products.find((item) => item.slug === slug)

  if (!product) notFound()

  const orderable = product.variants.filter((variant) => variant.availability !== 'UNAVAILABLE')
  const profile = getBespokeProfile(slug)
  const curatedTitle = product.isFixture ? profile?.title ?? product.name : product.name
  const curatedSubtitle = product.isFixture ? profile?.subtitle : undefined
  const categoryId = resolveCategoryId(slug)
  const cat = COLLECTION_CATEGORIES.find((c) => c.id === categoryId)

  return (
    <>
      <HomeNav />
      <main className="product-page">
        <div className="product-breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/collections">Bộ sưu tập</a>
          <span>/</span>
          <a href={`/collections#${categoryId}`}>
            {cat?.title.replace('Bộ sưu tập ', '') ?? 'Tác phẩm'}
          </a>
          <span>/</span>
          <span style={{ color: '#252a24', fontWeight: 500 }}>{curatedTitle}</span>
        </div>

        <div className="product-layout">
          <div className="product-preview-card">
            <ProductPreview
              slug={slug}
              name={getPreviewCoupleName()}
              shape={orderable[0]?.shape ?? 'FLAT'}
            />
          </div>

          <div className="product-info-panel">
            <ProductMetaHeader
              slug={slug}
              rawName={product.name}
              curatedTitle={curatedTitle}
              curatedSubtitle={curatedSubtitle}
              isFixture={product.isFixture}
            />

            <p className="product-desc">
              {product.isFixture
                ? 'Mẫu này giúp bạn tham khảo phong cách và bố cục. Thông số và giá sản phẩm thực tế đang được cập nhật.'
                : 'Xem các quy cách hiện có bên dưới. Chất liệu, kỹ thuật hoàn thiện và thời gian sẽ được xưởng xác nhận theo đơn hàng.'}
            </p>

            <div className="product-variants-box">
              <h3
                style={{
                  fontSize: '13px',
                  margin: '0 0 12px',
                  color: '#252a24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Quy cách &amp; Giá cơ bản
              </h3>
              {orderable.map((variant) => (
                <div key={variant.shape} className="product-variant-item">
                  <span className="product-variant-shape">
                    {shapeLabel[variant.shape] ?? variant.shape}
                  </span>
                  <span className="product-variant-price">
                    {product.isFixture
                      ? 'Mẫu minh họa'
                      : variant.unitAmountVnd === null
                      ? 'Liên hệ báo giá'
                      : `${Number(variant.unitAmountVnd).toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              ))}
            </div>

            <div className="product-specs">
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#32462f' }}>
                Thông tin cần xác nhận:
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Chất liệu và kỹ thuật hoàn thiện theo mẫu được chọn.</li>
                <li>Số lượng và thời gian thực hiện theo nhu cầu.</li>
                <li>Chi phí được xác nhận trước khi bạn chốt yêu cầu.</li>
              </ul>
            </div>

            <div style={{ marginTop: '24px' }}>
              <a
                href="/assistant"
                className="product-order-cta"
              >
                Hỏi về mẫu này &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
