'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type {
  BlogArticle,
  BlogCategoryId,
  BlogCategoryMeta,
} from '../../features/blog/blog-types'

type FilterValue = 'ALL' | BlogCategoryId

interface BlogIndexClientProps {
  articles: BlogArticle[]
  categories: BlogCategoryMeta[]
}

export function BlogIndexClient({ articles, categories }: BlogIndexClientProps) {
  const [activeCategory, setActiveCategory] = useState<FilterValue>('ALL')

  useEffect(() => {
    const syncFromUrl = () => {
      const param = new URLSearchParams(window.location.search).get('category')
      const matched = categories.some((cat) => cat.id === param)
      setActiveCategory(matched ? (param as BlogCategoryId) : 'ALL')
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [categories])

  const selectCategory = (next: FilterValue) => {
    setActiveCategory(next)
    const url = next === 'ALL' ? '/blog' : `/blog?category=${next}`
    window.history.pushState({}, '', url)
  }

  const filtered = useMemo(() => {
    if (activeCategory === 'ALL') return articles
    return articles.filter((item) => item.category === activeCategory)
  }, [articles, activeCategory])

  const activeMeta = categories.find((cat) => cat.id === activeCategory)
  const showFeatured = activeCategory === 'ALL' && filtered.length > 0
  const featured = showFeatured ? filtered[0] : null
  const gridItems = showFeatured ? filtered.slice(1) : filtered

  return (
    <section aria-label="Danh sách bài viết Tạp chí MORI">
      <div className="blog-filter-bar">
        <div className="blog-tab-row" role="tablist" aria-label="Chuyên mục bài viết">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'ALL'}
            className={`blog-tab-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => selectCategory('ALL')}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`blog-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="blog-filter-meta">
          <p className="blog-results-count" aria-live="polite">
            Đang hiển thị <strong>{filtered.length}</strong> / {articles.length} bài viết
          </p>
          <p className="blog-cat-summary">
            {activeMeta
              ? activeMeta.description
              : 'Tuyển tập ghi chép về giấy bã mía, phong cách thiệp và nghệ thuật cá nhân hóa.'}
          </p>
        </div>
      </div>

      {featured ? (
        <article className="blog-featured-card">
          <Link href={`/blog/${featured.slug}`} className="blog-featured-link">
            <div className="blog-featured-media">
              <Image
                src={featured.cover.src}
                width={featured.cover.width}
                height={featured.cover.height}
                alt={featured.cover.alt}
                sizes="(max-width: 900px) 100vw, 55vw"
                priority
              />
            </div>
            <div className="blog-featured-body">
              <div>
                <div className="blog-featured-meta">
                  <span className="blog-card-order">{featured.order}</span>
                  <span>{featured.categoryLabel}</span>
                  <span>·</span>
                  <span>{featured.readMinutes} phút đọc</span>
                </div>
                <h2 className="blog-featured-title">{featured.title}</h2>
                {featured.italicAccent ? (
                  <p className="blog-featured-tagline blog-accent">{featured.italicAccent}</p>
                ) : null}
                <p className="blog-featured-excerpt">{featured.excerpt}</p>
              </div>
              <span className="blog-card-cta">Đọc bài viết tiêu điểm ↗</span>
            </div>
          </Link>
        </article>
      ) : null}

      {gridItems.length === 0 && !featured ? (
        <div className="blog-empty">
          <p>Chưa có bài viết trong chuyên mục này.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {gridItems.map((article) => (
            <article key={article.slug} className="blog-card">
              <Link href={`/blog/${article.slug}`} className="blog-card-link">
                <div className="blog-card-media">
                  <Image
                    src={article.cover.src}
                    width={article.cover.width}
                    height={article.cover.height}
                    alt={article.cover.alt}
                    sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="blog-card-order">{article.order}</span>
                    <span>{article.categoryLabel}</span>
                    <span>·</span>
                    <span>{article.readMinutes} phút đọc</span>
                  </div>
                  <h2 className="blog-card-title">{article.title}</h2>
                  <p className="blog-card-excerpt">{article.excerpt}</p>
                  <span className="blog-card-cta">Đọc tiếp ↗</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
