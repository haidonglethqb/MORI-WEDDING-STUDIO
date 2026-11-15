import { notFound } from 'next/navigation'
import { HomeFooter } from '../../home-footer'
import { HomeNav } from '../../home-nav'
import { CartDrawerFallback } from '../../../features/cart/cart-drawer-fallback'
import {
  DIGITAL_CATALOG_ITEMS,
  formatVnd,
  getDigitalMeta,
  resolveDigitalPriceVnd,
} from '../../../features/cart/cart-types'
import { ProductPreview } from '../../../features/preview/product-preview'
import { resolveProductImageUrl } from '../../../features/preview/product-image'
import { getBespokeProfile } from '../../collections/collection-catalog-data'
import {
  COLLECTION_CATEGORIES,
  getPreviewCoupleName,
  resolveCategoryId,
} from '../../collections/collection-types'
import { DigitalProductPreview } from './digital-product-preview'
import { getShapeLabel, resolveProductCopy } from './product-copy'
import { loadCatalogueProducts, type CatalogueProduct } from './product-loader'
import { ProductMetaHeader } from './product-meta-header'
import { ProductOrderBox } from './product-order-box'
import '../../../features/cart/storefront-footer.css'
import './product.css'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await loadCatalogueProducts()
  const apiProduct = products.find((item) => item.slug === slug)
  const digitalMeta = getDigitalMeta(slug)

  if (!apiProduct && !digitalMeta) notFound()

  const isDigital = apiProduct?.type === 'DIGITAL' || slug.includes('-digital-') || Boolean(digitalMeta)
  const product: CatalogueProduct = apiProduct ?? {
    slug,
    name: digitalMeta?.name ?? slug,
    type: 'DIGITAL',
    description: digitalMeta?.description ?? null,
    imageUrl: null,
    isFixture: false,
    variants: [],
  }

  const orderable = product.variants.filter((variant) => variant.availability !== 'UNAVAILABLE')
  const profile = getBespokeProfile(slug)
  const { title: curatedTitle, subtitle: curatedSubtitle } = resolveProductCopy(
    product,
    profile?.title ?? digitalMeta?.name,
    profile?.subtitle ?? digitalMeta?.description,
  )
  const imageUrl = isDigital ? null : resolveProductImageUrl(product, slug)
  const categoryId = resolveCategoryId(slug)
  const cat = COLLECTION_CATEGORIES.find((c) => c.id === categoryId)
  const digitalPriceVnd = resolveDigitalPriceVnd(
    slug,
    orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd,
  )

  return (
    <>
      <HomeNav />
      <main className="product-page">
        <div className="product-breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="/collections">Bộ sưu tập</a>
          <span>/</span>
          <a href={isDigital ? '/collections?tab=online' : `/collections#${categoryId}`}>
            {isDigital ? 'Thiệp online' : cat?.title.replace('Bộ sưu tập ', '') ?? 'Tác phẩm'}
          </a>
          <span>/</span>
          <span className="product-breadcrumb-current">{curatedTitle}</span>
        </div>

        <div className="product-layout">
          <div className="product-preview-card">
            {isDigital ? (
              <DigitalProductPreview
                slug={slug}
                title={curatedTitle}
                accentColor={digitalMeta?.accentColor ?? cat?.accentColor}
              />
            ) : (
              <ProductPreview
                slug={slug}
                name={getPreviewCoupleName()}
                shape={orderable[0]?.shape ?? 'FLAT'}
                imageUrl={imageUrl}
                title={curatedTitle}
              />
            )}
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
              {isDigital
                ? 'Thiệp mời cưới dạng website riêng có đường link gửi nhanh qua Messenger, SMS hoặc tin nhắn, kèm đếm ngược ngày cưới, bản đồ chỉ đường và nút xác nhận tham dự (RSVP).'
                : product.isFixture
                  ? 'Mẫu minh họa giúp bạn tham khảo phong cách và bố cục. Thông số và giá sản phẩm thực tế đang được cập nhật.'
                  : 'Chất liệu giấy bã mía 350gsm cao cấp. Chọn quy cách, số lượng hoặc mua kèm Thiệp Online để nhận ưu đãi giảm 50%.'}
            </p>

            <div className="product-variants-box">
              <h3 className="product-variants-heading">
                {isDigital ? 'Thông tin gói Thiệp Online' : 'Quy cách & Giá cơ bản'}
              </h3>
              {isDigital ? (
                <div className="product-variant-item">
                  <span className="product-variant-shape">Website thiệp online trọn gói</span>
                  <span className="product-variant-price">{formatVnd(digitalPriceVnd)}</span>
                </div>
              ) : (
                orderable.map((variant) => (
                  <div key={variant.shape} className="product-variant-item">
                    <span className="product-variant-shape">{getShapeLabel(variant.shape)}</span>
                    <span className="product-variant-price">
                      {product.isFixture
                        ? 'Mẫu minh họa'
                        : variant.unitAmountVnd === null
                          ? 'Liên hệ báo giá'
                          : formatVnd(Number(variant.unitAmountVnd))}
                    </span>
                  </div>
                ))
              )}
            </div>

            <ProductOrderBox
              slug={slug}
              title={curatedTitle}
              productType={isDigital ? 'DIGITAL' : 'PAPER'}
              imageUrl={imageUrl}
              variants={orderable.map((v) => ({ shape: v.shape, unitAmountVnd: v.unitAmountVnd }))}
              digitalPriceVnd={digitalPriceVnd}
              digitalOptions={DIGITAL_CATALOG_ITEMS}
              isFixture={product.isFixture}
            />

            <div className="product-specs">
              <p className="product-specs-title">
                {isDigital ? 'Bao gồm trong gói Thiệp Online:' : 'Thông tin xưởng MORI:'}
              </p>
              <ul className="product-specs-list">
                {isDigital ? (
                  <>
                    <li>Đường link mời riêng gửi nhanh qua Messenger, SMS và ứng dụng nhắn tin.</li>
                    <li>Đếm ngược ngày cưới, bản đồ chỉ đường và phản hồi RSVP tự động.</li>
                  </>
                ) : (
                  <>
                    <li>Chất liệu giấy bã mía 350gsm và hoàn thiện sắc nét tại xưởng MORI.</li>
                    <li>Giảm ngay 50% khi đặt kèm Thiệp Online trong cùng đơn hàng.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="product-cta-wrap">
              <a href="/assistant" className="product-order-cta">
                Hỏi trợ lý AI về mẫu này →
              </a>
            </div>
          </div>
        </div>
      </main>
      <CartDrawerFallback />
      <HomeFooter />
    </>
  )
}
