import { CollectionCard } from './collection-card'
import type { CollectionCategory, CollectionItem } from './collection-types'
import { MoriIcon } from '../../components/mori-icon'

interface CategorySectionProps {
  category: CollectionCategory
  items: CollectionItem[]
}

export function CollectionCategorySection({ category, items }: CategorySectionProps) {
  if (items.length === 0) return null

  return (
    <section className={`category-section-block section-theme-${category.id}`} id={`sec-${category.id}`}>
      {/* Category Editorial Header */}
      <div className="category-section-header">
        <div className="cat-header-top">
          <span className="cat-header-badge" style={{ borderColor: category.accentColor, color: category.accentColor }}>
            <MoriIcon className="cat-badge-icon" name={category.icon} />
            {category.badge}
          </span>
          <span className="cat-item-count">{items.length} mẫu thiết kế</span>
        </div>

        <h2 className="cat-section-title">{category.title}</h2>
        <p className="cat-section-subtitle">{category.subtitle}</p>
      </div>

      {/* Grid of unique cards for this category */}
      <div className="collections-artisan-grid">
        {items.map((item) => (
          <CollectionCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  )
}
