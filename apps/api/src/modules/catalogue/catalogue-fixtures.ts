import type { CatalogueProduct, CatalogueQuery } from '@mori/contracts'
import { CATALOGUE_PRODUCTS } from './catalogue-data.js'

export function getFixtureCatalogue(query: CatalogueQuery): CatalogueProduct[] {
  return CATALOGUE_PRODUCTS.map((item, idx) => ({ item, idx }))
    .filter(({ item }) => {
      if (query.type && item.type !== query.type) return false
      if (query.style && !item.styleTags.includes(query.style)) return false
      if (query.shape && (item.type !== 'PAPER' || item.shape !== query.shape)) return false
      return true
    })
    .map(({ item, idx }) => ({
      slug: item.slug,
      name: item.name,
      type: item.type,
      isFixture: false,
      imageUrl: item.imageUrl,
      styleTags: [...item.styleTags],
      variants:
        item.type === 'PAPER' && item.shape
          ? [
              {
                id: `00000000-0000-4000-8000-${String(idx + 1).padStart(12, '0')}`,
                shape: item.shape,
                availability: 'AVAILABLE' as const,
                unitAmountVnd: item.unitAmountVnd.toString(),
              },
            ]
          : [],
    }))
}
