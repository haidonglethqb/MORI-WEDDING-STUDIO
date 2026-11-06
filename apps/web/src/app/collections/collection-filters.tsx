'use client'

import { useState, useMemo, useEffect } from 'react'
import { CollectionCard } from './collection-card'
import { CollectionCategorySection } from './collection-category-section'
import { COLLECTION_CATEGORIES, type CollectionItem } from './collection-types'
import { MoriIcon } from '../../components/mori-icon'

const SHAPES = [
  { id: 'ALL', label: 'Tất cả quy cách' },
  { id: 'BIFOLD', label: 'Khổ gấp đôi' },
  { id: 'FLAT', label: 'Khổ đơn phẳng' },
  { id: 'TRIFOLD', label: 'Khổ gấp ba' },
]

export function CollectionFilters({ items }: { items: CollectionItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedShape, setSelectedShape] = useState<string>('ALL')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setSelectedCategory(params.get('style') ?? 'ALL')
      setSelectedShape(params.get('shape') ?? 'ALL')
      setQuery(params.get('q') ?? '')
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  function updateUrl(next: { style: string; shape: string; query: string }, mode: 'push' | 'replace' = 'push') {
    const params = new URLSearchParams()
    if (next.style !== 'ALL') params.set('style', next.style)
    if (next.shape !== 'ALL') params.set('shape', next.shape)
    if (next.query.trim()) params.set('q', next.query.trim())
    const queryString = params.toString()
    const url = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
    window.history[`${mode}State`]({}, '', url)
  }

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
        item.categoryLabel.toLowerCase().includes(q)
      return matchCat && matchShape && matchQuery
    })
  }, [items, selectedCategory, selectedShape, query])

  const resetAll = () => {
    setSelectedCategory('ALL')
    setSelectedShape('ALL')
    setQuery('')
    updateUrl({ style: 'ALL', shape: 'ALL', query: '' })
  }

  return (
    <div>
      {/* Sticky Interactive Filter Bar */}
      <div className="filter-panel-wrap">
        <div className="filter-row-top">
          <div className="search-input-box">
            <label className="visually-hidden" htmlFor="collection-search">Tìm mẫu thiệp</label>
            <MoriIcon className="search-icon" name="search" />
            <input
              id="collection-search"
              type="text"
              placeholder="Tìm theo phong cách hoặc tên mẫu"
              value={query}
              onChange={(e) => {
                const value = e.target.value
                setQuery(value)
                updateUrl({ style: selectedCategory, shape: selectedShape, query: value }, 'replace')
              }}
              className="search-input"
            />
            {query && (
              <button type="button" onClick={() => {
                setQuery('')
                updateUrl({ style: selectedCategory, shape: selectedShape, query: '' }, 'replace')
              }} className="search-clear" aria-label="Xóa nội dung tìm kiếm">
                <MoriIcon name="close" />
              </button>
            )}
          </div>

          <div className="shape-toggle-group">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                type="button"
                className={`shape-toggle-btn ${selectedShape === shape.id ? 'active' : ''}`}
                aria-pressed={selectedShape === shape.id}
                onClick={() => {
                  setSelectedShape(shape.id)
                  updateUrl({ style: selectedCategory, shape: shape.id, query })
                }}
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
            aria-pressed={selectedCategory === 'ALL'}
            onClick={() => {
              setSelectedCategory('ALL')
              updateUrl({ style: 'ALL', shape: selectedShape, query })
            }}
          >
            Tất cả bộ sưu tập
          </button>
          {COLLECTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`style-tab-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                updateUrl({ style: cat.id, shape: selectedShape, query })
              }}
            >
              <MoriIcon className="tab-cat-icon" name={cat.icon} />
              {cat.title.replace('Bộ sưu tập ', '')}
            </button>
          ))}
        </div>

        {/* Counter & Clear Action */}
        <div className="results-counter-row">
          <span aria-live="polite">
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
      {items.length === 0 ? (
        <div className="collections-empty-box" role="status">
          <p className="empty-title">Bộ sưu tập đang được cập nhật</p>
          <p className="empty-sub">Bạn có thể trao đổi với MORI để tìm hướng thiết kế phù hợp.</p>
          <a href="/assistant" className="empty-reset-btn">Trao đổi với MORI</a>
        </div>
      ) : !isFiltering ? (
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
