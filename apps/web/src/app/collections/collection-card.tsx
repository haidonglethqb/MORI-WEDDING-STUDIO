import { CollectionCardVisual } from './collection-card-visual'
import type { CollectionItem } from './collection-types'

export type { CollectionItem }

function resolveShapeBadge(item: CollectionItem): string {
  if (item.productType === 'DIGITAL' || item.shape === 'DIGITAL') return 'Website thiệp online'
  if (item.shape === 'BIFOLD') return 'Khổ gấp đôi'
  if (item.shape === 'TRIFOLD') return 'Khổ gấp ba'
  return 'Khổ đơn phẳng'
}

export function CollectionCard({ item }: { item: CollectionItem }) {
  const formattedPrice = !item.isFixture && item.minPriceVnd
    ? item.productType === 'DIGITAL'
      ? `${BigInt(item.minPriceVnd).toLocaleString('vi-VN')} ₫`
      : `Từ ${BigInt(item.minPriceVnd).toLocaleString('vi-VN')} ₫`
    : item.isFixture ? 'Mẫu minh họa' : 'Đang cập nhật'

  return (
    <article className={`artisan-collection-card card-cat-${item.categoryId}`}>
      <a
        href={`/products/${item.slug}`}
        className="artisan-card-link"
        aria-label={`Xem chi tiết tác phẩm ${item.curatedTitle}`}
      >
        <CollectionCardVisual item={item} />

        <div className="artisan-card-body">
          <div className="artisan-specs-row">
            <span className="spec-type-pill">
              {item.productType === 'DIGITAL' ? 'Thiệp online' : 'Thiệp giấy'}
            </span>
            <span className="spec-shape-pill">{resolveShapeBadge(item)}</span>
            {item.isFixture ? <span className="spec-material-tag">Thông tin mẫu</span> : null}
          </div>

          <h3 className="artisan-curated-title">{item.curatedTitle}</h3>
          <p className="artisan-curated-desc">{item.curatedDesc}</p>
          <span className="artisan-sku-code">{item.skuName}</span>

          <div className="artisan-card-footer">
            <div className="artisan-price-block">
              <span className="price-lead-label">
                {item.isFixture ? 'Giá và quy cách' : item.productType === 'DIGITAL' ? 'Trọn gói' : 'Giá tham khảo'}
              </span>
              <span className="price-main-vnd">{formattedPrice}</span>
            </div>
            <span className="artisan-cta-link">Xem chi tiết &rarr;</span>
          </div>
        </div>
      </a>
    </article>
  )
}
