import { CALLIGRAPHY_AND_DIGITAL_PRODUCTS } from './catalogue-data-calligraphy-digital.js'
import { EDITORIAL_PRODUCTS } from './catalogue-data-editorial.js'
import { FLORAL_PRODUCTS } from './catalogue-data-floral.js'
import { HERITAGE_PRODUCTS } from './catalogue-data-heritage.js'
import { MINIMALIST_PRODUCTS } from './catalogue-data-minimalist.js'
import type { CatalogueDefinition } from './catalogue-types.js'

export type { CatalogueDefinition } from './catalogue-types.js'

export const CATALOGUE_PRODUCTS: readonly CatalogueDefinition[] = [
  ...EDITORIAL_PRODUCTS,
  ...FLORAL_PRODUCTS,
  ...HERITAGE_PRODUCTS,
  ...MINIMALIST_PRODUCTS,
  ...CALLIGRAPHY_AND_DIGITAL_PRODUCTS,
]
