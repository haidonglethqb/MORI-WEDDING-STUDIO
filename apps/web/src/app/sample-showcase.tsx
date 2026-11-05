'use client'

import { useState } from 'react'
import { CollectionCardVisual } from './collections/collection-card-visual'
import { buildCuratedItem } from './collections/collection-types'

export interface ShowcaseProduct {
  slug: string
  name: string
  styleCategory: string
  shape: 'BIFOLD' | 'FLAT'
  priceVnd: string
  badge: string
}

const FALLBACK_PRODUCTS: ShowcaseProduct[] = [
  {
    slug: 'editorial-bifold-01',
    name: "L'Amour Vogue No. 1",
    styleCategory: 'Editorial Vogue',
    shape: 'BIFOLD',
    priceVnd: '45000',
    badge: 'Gấp đôi',
  },
  {
    slug: 'editorial-flat-01',
    name: 'Haute Couture Élysée',
    styleCategory: 'Editorial Vogue',
    shape: 'FLAT',
    priceVnd: '32000',
    badge: 'Dạng phẳng',
  },
  {
    slug: 'floral-bifold-01',
    name: 'Jardin Botanique No. 1',
    styleCategory: 'Floral Botanical',
    shape: 'BIFOLD',
    priceVnd: '42000',
    badge: 'Gấp đôi',
  },
  {
    slug: 'traditional-flat-01',
    name: 'Hoàng Kim Hỷ Sự No. 1',
    styleCategory: 'Heritage Á Đông',
    shape: 'FLAT',
    priceVnd: '35000',
    badge: 'Dạng phẳng',
  },
  {
    slug: 'minimalist-bifold-01',
    name: 'Wabi-Sabi Kyoto No. 1',
    styleCategory: 'Minimalist Japandi',
    shape: 'BIFOLD',
    priceVnd: '38000',
    badge: 'Gấp đôi',
  },
  {
    slug: 'modern-calligraphy-01',
    name: 'Florence Script No. 1',
    styleCategory: 'Modern Calligraphy',
    shape: 'FLAT',
    priceVnd: '34000',
    badge: 'Dạng phẳng',
  },
]

export function SampleShowcase({ products }: { products: ShowcaseProduct[] }) {
  const [filter, setFilter] = useState<'ALL' | 'BIFOLD' | 'FLAT'>('ALL')
  const list = products.length > 0 ? products : FALLBACK_PRODUCTS
  const filtered = filter === 'ALL' ? list : list.filter((p) => p.shape === filter)

  return (
    <div>
      <div className="showcase-filter-bar">
        <button
          type="button"
          className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          Tất cả thiết kế ({list.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${filter === 'BIFOLD' ? 'active' : ''}`}
          onClick={() => setFilter('BIFOLD')}
        >
          Thiệp gấp đôi (Bi-fold)
        </button>
        <button
          type="button"
          className={`filter-pill ${filter === 'FLAT' ? 'active' : ''}`}
          onClick={() => setFilter('FLAT')}
        >
          Thiệp đơn phẳng (Flat Card)
        </button>
      </div>

      <div className="collections-artisan-grid">
        {filtered.map((item, idx) => {
          const curated = buildCuratedItem(
            {
              slug: item.slug,
              name: item.name,
              shape: item.shape,
              minPriceVnd: item.priceVnd,
            },
            idx,
          )

          return (
            <article key={item.slug} className="artisan-collection-card">
              <a href={`/products/${item.slug}`} className="artisan-card-link">
                <CollectionCardVisual item={curated} />

                <div className="artisan-card-body">
                  <div className="artisan-specs-row">
                    <span className="spec-shape-pill">
                      {item.shape === 'BIFOLD' ? 'Khổ gấp đôi 2 mặt' : 'Khổ đơn phẳng 2 mặt'}
                    </span>
                    <span className="spec-material-tag">Giấy bã mía 350gsm</span>
                  </div>

                  <h3 className="artisan-curated-title">{curated.curatedTitle}</h3>
                  <p className="artisan-curated-desc">{curated.curatedDesc}</p>
                  <span className="artisan-sku-code">{item.name}</span>

                  <div className="artisan-card-footer">
                    <div className="artisan-price-block">
                      <span className="price-lead-label">Giá hoàn thiện</span>
                      <span className="price-main-vnd">
                        Từ {Number(item.priceVnd).toLocaleString('vi-VN')} ₫
                      </span>
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
