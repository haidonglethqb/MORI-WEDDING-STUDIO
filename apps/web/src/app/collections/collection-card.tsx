import { CollectionCardVisual } from './collection-card-visual'
import type { CollectionItem } from './collection-types'

export type { CollectionItem }

export function CollectionCard({ item }: { item: CollectionItem }) {
  const isBifold = item.shape === 'BIFOLD'
  const formattedPrice = item.minPriceVnd
    ? `Từ ${Number(item.minPriceVnd).toLocaleString('vi-VN')} ₫`
    : 'Liên hệ xưởng'

  return (
    <article className={`artisan-collection-card card-cat-${item.categoryId}`}>
      <a
        href={`/products/${item.slug}`}
        className="artisan-card-link"
        aria-label={`Xem chi tiết tác phẩm ${item.curatedTitle}`}
      >
        {/* Custom Visual Paper Stage */}
        <CollectionCardVisual item={item} />

        {/* Card Content & Metadata */}
        <div className="artisan-card-body">
          <div className="artisan-specs-row">
            <span className="spec-shape-pill">
              {isBifold ? 'Khổ gấp đôi 2 mặt' : 'Khổ đơn phẳng 2 mặt'}
            </span>
            <span className="spec-material-tag">Giấy bã mía 350gsm</span>
          </div>

          <h3 className="artisan-curated-title">{item.curatedTitle}</h3>
          <p className="artisan-curated-desc">{item.curatedDesc}</p>
          <span className="artisan-sku-code">{item.skuName}</span>

          <div className="artisan-card-footer">
            <div className="artisan-price-block">
              <span className="price-lead-label">Giá hoàn thiện</span>
              <span className="price-main-vnd">{formattedPrice}</span>
            </div>
            <span className="artisan-cta-link">
              Khám phá &amp; 3D &rarr;
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}
