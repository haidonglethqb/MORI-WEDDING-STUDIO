'use client'

import { useState } from 'react'
import { CollectionCardVisual } from './collections/collection-card-visual'
import { buildCuratedItem } from './collections/collection-types'

export interface ShowcaseProduct {
  slug: string
  name: string
  shape: 'BIFOLD' | 'FLAT' | 'TRIFOLD'
  priceVnd: string | null
  isFixture: boolean
}

export function SampleShowcase({ products }: { products: ShowcaseProduct[] }) {
  const [filter, setFilter] = useState<'ALL' | 'BIFOLD' | 'FLAT' | 'TRIFOLD'>('ALL')
  const list = products
  const filtered = filter === 'ALL' ? list : list.filter((p) => p.shape === filter)

  if (list.length === 0) {
    return (
      <div className="collections-empty-box">
        <p className="empty-title">Bộ sưu tập đang được cập nhật</p>
        <p className="empty-sub">Bạn vẫn có thể trao đổi với xưởng để tìm hướng thiết kế phù hợp.</p>
        <a className="home-cta" href="/assistant">Trao đổi với MORI</a>
      </div>
    )
  }

  return (
    <div>
      <div className="showcase-filter-bar">
        <button
          type="button"
          className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          aria-pressed={filter === 'ALL'}
          onClick={() => setFilter('ALL')}
        >
          Tất cả thiết kế ({list.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${filter === 'BIFOLD' ? 'active' : ''}`}
          aria-pressed={filter === 'BIFOLD'}
          onClick={() => setFilter('BIFOLD')}
        >
          Thiệp gấp đôi (Bi-fold)
        </button>
        <button
          type="button"
          className={`filter-pill ${filter === 'FLAT' ? 'active' : ''}`}
          aria-pressed={filter === 'FLAT'}
          onClick={() => setFilter('FLAT')}
        >
          Thiệp đơn phẳng (Flat Card)
        </button>
        {list.some((item) => item.shape === 'TRIFOLD') ? (
          <button type="button" className={`filter-pill ${filter === 'TRIFOLD' ? 'active' : ''}`} aria-pressed={filter === 'TRIFOLD'} onClick={() => setFilter('TRIFOLD')}>
            Thiệp gấp ba
          </button>
        ) : null}
      </div>

      <div className="collections-artisan-grid">
        {filtered.map((item) => {
          const curated = buildCuratedItem(
            {
              slug: item.slug,
              name: item.name,
              shape: item.shape,
              minPriceVnd: item.priceVnd,
              isFixture: item.isFixture,
            },
          )

          return (
            <article key={item.slug} className="artisan-collection-card">
              <a href={`/products/${item.slug}`} className="artisan-card-link">
                <CollectionCardVisual item={curated} />

                <div className="artisan-card-body">
                  <div className="artisan-specs-row">
                    <span className="spec-shape-pill">
                      {item.shape === 'BIFOLD' ? 'Khổ gấp đôi' : item.shape === 'TRIFOLD' ? 'Khổ gấp ba' : 'Khổ đơn phẳng'}
                    </span>
                    {item.isFixture ? <span className="spec-material-tag">Mẫu minh họa</span> : null}
                  </div>

                  <h3 className="artisan-curated-title">{curated.curatedTitle}</h3>
                  <p className="artisan-curated-desc">{curated.curatedDesc}</p>
                  <span className="artisan-sku-code">{item.name}</span>

                  <div className="artisan-card-footer">
                    <div className="artisan-price-block">
                      <span className="price-lead-label">{item.isFixture ? 'Giá và quy cách' : 'Giá tham khảo'}</span>
                      <span className="price-main-vnd">{item.isFixture ? 'Mẫu minh họa' : item.priceVnd ? `Từ ${BigInt(item.priceVnd).toLocaleString('vi-VN')} ₫` : 'Đang cập nhật'}</span>
                    </div>
                    <span className="artisan-cta-link">Trải nghiệm 3D &rarr;</span>
                  </div>
                </div>
              </a>
            </article>
          )
        })}
      </div>
    </div>
  )
}
