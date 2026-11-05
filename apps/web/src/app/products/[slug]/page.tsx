import { notFound } from 'next/navigation'
import { HomeNav } from '../../home-nav'
import { ProductPreview } from '../../../features/preview/product-preview'
import { getBespokeProfile } from '../../collections/collection-catalog-data'
import { COLLECTION_CATEGORIES, resolveCategoryId, resolveSampleCouple } from '../../collections/collection-types'
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
  const product = products.find((item) => item.slug === slug)
  if (!product) notFound()

  const orderable = product.variants.filter((variant) => variant.availability !== 'UNAVAILABLE')
  const profile = getBespokeProfile(slug)
  const curatedTitle = profile?.title ?? product.name
  const curatedSubtitle = profile?.subtitle
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
          <a href={`/collections#${categoryId}`}>{cat?.title.replace('Bộ sưu tập ', '') ?? 'Tác phẩm'}</a>
          <span>/</span>
          <span style={{ color: '#252a24', fontWeight: 500 }}>{curatedTitle}</span>
        </div>

        <div className="product-layout">
          <div className="product-preview-card">
            <ProductPreview slug={slug} name={resolveSampleCouple(slug)} shape={orderable[0]?.shape ?? 'FLAT'} />
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
              Thiệp cưới cao cấp từ MORI Studio được in trên nền giấy bã mía sinh thái bền vững, ép kim chìm nhiệt độ cao
              và hoàn thiện hoàn toàn thủ công từ đôi bàn tay của các nghệ nhân xưởng.
            </p>

            <div className="product-variants-box">
              <h3 style={{ fontSize: '13px', margin: '0 0 12px', color: '#252a24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Quy cách &amp; Giá cơ bản
              </h3>
              {orderable.map((variant) => (
                <div key={variant.shape} className="product-variant-item">
                  <span className="product-variant-shape">{shapeLabel[variant.shape] ?? variant.shape}</span>
                  <span className="product-variant-price">
                    {variant.unitAmountVnd === null
                      ? 'Liên hệ báo giá'
                      : `${Number(variant.unitAmountVnd).toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              ))}
            </div>

            <div className="product-specs">
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#32462f' }}>Chất liệu &amp; Quy chuẩn xưởng:</p>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                <li>Giấy bã mía tự nhiên 350gsm màu ngà ấm áp.</li>
                <li>Mực in khoáng gốc đậu nành an toàn thân thiện môi trường.</li>
                <li>Tặng kèm trang thiệp điện tử RSVP tương thích mọi điện thoại.</li>
              </ul>
            </div>

            <div style={{ marginTop: '24px' }}>
              <a href="/workspace" className="product-order-cta">
                Bắt đầu thiết kế &amp; Đặt in mẫu này &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
