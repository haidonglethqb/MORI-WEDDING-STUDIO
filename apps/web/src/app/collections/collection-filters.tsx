'use client'

import { useState, useMemo } from 'react'
import { CollectionCard } from './collection-card'
import { CollectionCategorySection } from './collection-category-section'
import { COLLECTION_CATEGORIES, type CollectionItem } from './collection-types'

const SHAPES = [
  { id: 'ALL', label: 'Tất cả quy cách' },
  { id: 'BIFOLD', label: 'Khổ gấp đôi' },
  { id: 'FLAT', label: 'Khổ đơn phẳng' },
]

export function CollectionFilters({ items }: { items: CollectionItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedShape, setSelectedShape] = useState<string>('ALL')
  const [query, setQuery] = useState('')

  const isFiltering = selectedCategory !== 'ALL' || selectedShape !== 'ALL' || query.trim() !== ''

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory
      const matchShape = selectedShape === 'ALL' || item.shape === selectedShape
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        item.curatedTitle.toLowerCase().includes(q) ||
        item.skuName.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.sampleCouple.toLowerCase().includes(q)
      return matchCat && matchShape && matchQuery
    })
  }, [items, selectedCategory, selectedShape, query])

  const resetAll = () => {
    setSelectedCategory('ALL')
    setSelectedShape('ALL')
    setQuery('')
  }

  return (
    <div>
      {/* Sticky Interactive Filter Bar */}
      <div className="filter-panel-wrap">
        <div className="filter-row-top">
          <div className="search-input-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo phong cách, tên tác phẩm, tên cặp đôi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="search-clear">
                ✕
              </button>
            )}
          </div>

          <div className="shape-toggle-group">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                type="button"
                className={`shape-toggle-btn ${selectedShape === shape.id ? 'active' : ''}`}
                onClick={() => setSelectedShape(shape.id)}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills with Icons */}
        <div className="style-tabs-row">
          <button
            type="button"
            className={`style-tab-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            ✦ Tất cả bộ sưu tập
          </button>
          {COLLECTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`style-tab-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="tab-cat-icon">{cat.icon}</span>
              {cat.title.replace('Bộ sưu tập ', '')}
            </button>
          ))}
        </div>

        {/* Counter & Clear Action */}
        <div className="results-counter-row">
          <span>
            Đang hiển thị <strong>{filteredItems.length}</strong> / {items.length} tác phẩm thủ công
          </span>
          {isFiltering && (
            <button type="button" onClick={resetAll} className="reset-filter-btn">
              Xem toàn bộ theo danh mục ✕
            </button>
          )}
        </div>
      </div>

      {/* Categorized View (Default) vs Filtered Grid */}
      {!isFiltering ? (
        <div className="categorized-sections-wrap">
          {COLLECTION_CATEGORIES.map((category) => {
            const catItems = items.filter((it) => it.categoryId === category.id)
            return (
              <CollectionCategorySection
                key={category.id}
                category={category}
                items={catItems}
              />
            )
          })}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="collections-empty-box">
          <p className="empty-title">Không tìm thấy tác phẩm phù hợp</p>
          <p className="empty-sub">Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
          <button type="button" onClick={resetAll} className="empty-reset-btn">
            Xem toàn bộ thiết kế
          </button>
        </div>
      ) : (
        <div className="collections-artisan-grid">
          {filteredItems.map((item) => (
            <CollectionCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
