'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FAQ_CATEGORIES_PART1 } from './faq-data-part1'
import { FAQ_CATEGORIES_PART2 } from './faq-data-part2'
import { FaqCategoryIcon } from './faq-category-icon'
import type { FaqCategoryId } from './faq-types'

const ALL_CATEGORIES = [...FAQ_CATEGORIES_PART1, ...FAQ_CATEGORIES_PART2]

export function FaqClient() {
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId>('products')
  const [openNumber, setOpenNumber] = useState<number | null>(1)

  const currentCategory =
    ALL_CATEGORIES.find((cat) => cat.id === activeCategory) ?? ALL_CATEGORIES[0]

  function handleSelectCategory(id: FaqCategoryId) {
    setActiveCategory(id)
    const found = ALL_CATEGORIES.find((cat) => cat.id === id)
    setOpenNumber(found?.items[0]?.number ?? null)
  }

  return (
    <div className="faq-shell">
      <div className="faq-two-col">
        <aside className="faq-sidebar" aria-label="Danh mục câu hỏi">
          {ALL_CATEGORIES.map((category) => {
            const isActive = category.id === activeCategory
            return (
              <button
                key={category.id}
                type="button"
                className={`faq-cat-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleSelectCategory(category.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="faq-cat-left">
                  <span className="faq-cat-icon">
                    <FaqCategoryIcon id={category.id} />
                  </span>
                  <span className="faq-cat-name">{category.title}</span>
                </span>
                <span className="faq-cat-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            )
          })}
        </aside>

        <section className="faq-content-pane" aria-live="polite">
          <div className="faq-pane-head">
            <h2>{currentCategory?.title}</h2>
            <span>{currentCategory?.items.length ?? 0} câu hỏi</span>
          </div>

          <div className="faq-accordion-list">
            {currentCategory?.items.map((item) => {
              const isOpen = openNumber === item.number
              return (
                <article
                  key={item.number}
                  className={`faq-item-card ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-item-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenNumber(isOpen ? null : item.number)}
                  >
                    <span className="faq-item-q">{item.question}</span>
                    <span className="faq-item-symbol" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="faq-item-body">
                      {item.answers.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                      {item.bullets && item.bullets.length > 0 ? (
                        <ul className="faq-item-bullets">
                          {item.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <section className="faq-bottom-banner">
        <div className="faq-bottom-qmark" aria-hidden="true">
          ?
        </div>
        <h2>“Bạn vẫn còn thắc mắc?”</h2>
        <p>
          MORI rất vui được lắng nghe và hỗ trợ bạn lựa chọn mẫu thiệp phù hợp với ngày cưới của mình.
        </p>
        <div className="guide-cta-actions">
          <Link href="/assistant" className="guide-btn-primary">
            Hỏi trợ lý MORI
          </Link>
          <Link href="/collections?tab=custom" className="guide-btn-secondary">
            Liên hệ nhân viên
          </Link>
        </div>
      </section>
    </div>
  )
}
