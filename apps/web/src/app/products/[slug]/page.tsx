import { notFound } from 'next/navigation'
import { HomeNav } from '../../home-nav'
import { ProductPreview } from '../../../features/preview/product-preview'
import { resolveProductImageUrl } from '../../../features/preview/product-image'
import { getBespokeProfile } from '../../collections/collection-catalog-data'
import {
  COLLECTION_CATEGORIES,
  resolveCategoryId,
  getPreviewCoupleName,
} from '../../collections/collection-types'
import { getShapeLabel, resolveProductCopy } from './product-copy'
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
  description?: string | null
  imageUrl?: string | null
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
  const profile = getBespokeProfile(slug)
  const { title: curatedTitle, subtitle: curatedSubtitle } = resolveProductCopy(
    product,
    profile?.title,
    profile?.subtitle,
  )
  const imageUrl = resolveProductImageUrl(product, slug)
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
          <span className="product-breadcrumb-current">{curatedTitle}</span>
        </div>

        <div className="product-layout">
          <div className="product-preview-card">
            <ProductPreview
              slug={slug}
              name={getPreviewCoupleName()}
              shape={orderable[0]?.shape ?? 'FLAT'}
              imageUrl={imageUrl}
              title={curatedTitle}
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
                ? 'Mẫu minh họa giúp bạn tham khảo phong cách và bố cục. Thông số và giá sản phẩm thực tế đang được cập nhật.'
                : 'Xem các quy cách hiện có bên dưới. Chất liệu giấy 350gsm, kỹ thuật hoàn thiện và tiến độ sẽ được xưởng xác nhận theo yêu cầu.'}
            </p>

            <div className="product-variants-box">
              <h3 className="product-variants-heading">Quy cách &amp; Giá cơ bản</h3>
              {orderable.map((variant) => (
                <div key={variant.shape} className="product-variant-item">
                  <span className="product-variant-shape">
                    {getShapeLabel(variant.shape)}
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
              <p className="product-specs-title">Thông tin cần xác nhận:</p>
              <ul className="product-specs-list">
                <li>Chất liệu giấy bã mía 350gsm và kỹ thuật hoàn thiện theo mẫu được chọn.</li>
                <li>Số lượng bộ thiệp và thời gian thực hiện theo lịch trình của bạn.</li>
                <li>Chi phí được xác nhận rõ ràng trước khi bạn chốt yêu cầu.</li>
              </ul>
            </div>

            <div className="product-cta-wrap">
              <a href="/assistant" className="product-order-cta">
                Hỏi về mẫu này &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
