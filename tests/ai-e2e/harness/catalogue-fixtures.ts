/**
 * Grounded database fixtures for MORI AI v2 E2E testing.
 * All fixtures are marked with isFixture: true per rule #12.
 */

export interface TestProductVariant {
  id: string
  productId: string
  shape: 'FLAT' | 'BIFOLD' | 'TRIFOLD'
  availability: 'AVAILABLE' | 'QUOTE_REQUIRED' | 'UNAVAILABLE'
  priceRules: TestPriceRule[]
}

export interface TestPriceRule {
  id: string
  variantId: string
  quantityMin: number
  quantityMax: number
  unitAmountVnd: bigint
  setupAmountVnd: bigint
}

export interface TestProduct {
  id: string
  slug: string
  name: string
  state: 'ACTIVE' | 'ARCHIVED'
  isFixture: boolean
  styleTags: string[]
  colourTags: string[]
  variants: TestProductVariant[]
}

// Canonical Active Product: Song Hy Cung Dinh
export const PRODUCT_SONG_HY: TestProduct = {
  id: 'prod-song-hy-01',
  slug: 'song-hy-cung-dinh',
  name: 'Song Hỷ Cung Đình',
  state: 'ACTIVE',
  isFixture: true,
  styleTags: ['traditional', 'heritage', 'indochine'],
  colourTags: ['red', 'gold', 'crimson'],
  variants: [
    {
      id: 'var-song-hy-bifold',
      productId: 'prod-song-hy-01',
      shape: 'BIFOLD',
      availability: 'AVAILABLE',
      priceRules: [
        {
          id: 'rule-sh-bifold-t1',
          variantId: 'var-song-hy-bifold',
          quantityMin: 1,
          quantityMax: 49,
          unitAmountVnd: 38000n,
          setupAmountVnd: 500000n,
        },
        {
          id: 'rule-sh-bifold-t2',
          variantId: 'var-song-hy-bifold',
          quantityMin: 50,
          quantityMax: 99,
          unitAmountVnd: 28000n,
          setupAmountVnd: 500000n, // At 80 qty: 80 * 28k + 500k = 2.740.000 VND (T11 & T09)
        },
        {
          id: 'rule-sh-bifold-t3',
          variantId: 'var-song-hy-bifold',
          quantityMin: 100,
          quantityMax: 500,
          unitAmountVnd: 24000n,
          setupAmountVnd: 300000n,
        },
      ],
    },
    {
      id: 'var-song-hy-flat',
      productId: 'prod-song-hy-01',
      shape: 'FLAT',
      availability: 'AVAILABLE',
      priceRules: [
        {
          id: 'rule-sh-flat-t1',
          variantId: 'var-song-hy-flat',
          quantityMin: 1,
          quantityMax: 99,
          unitAmountVnd: 25000n,
          setupAmountVnd: 300000n,
        },
      ],
    },
  ],
}

// Quote-Required Product: Duyen Khoi Custom
export const PRODUCT_DUYEN_KHOI_QUOTE: TestProduct = {
  id: 'prod-duyen-khoi-02',
  slug: 'duyen-khoi-tram-nam',
  name: 'Duyên Khởi Trăm Năm (Custom)',
  state: 'ACTIVE',
  isFixture: true,
  styleTags: ['traditional', 'bespoke'],
  colourTags: ['gold'],
  variants: [
    {
      id: 'var-duyen-khoi-quote',
      productId: 'prod-duyen-khoi-02',
      shape: 'FLAT',
      availability: 'QUOTE_REQUIRED',
      priceRules: [],
    },
  ],
}

// Trifold / Unavailable Variant Product: Komorebi
export const PRODUCT_KOMOREBI_TRIFOLD: TestProduct = {
  id: 'prod-komorebi-03',
  slug: 'komorebi-wabi-sabi',
  name: 'Komorebi Wabi-Sabi Trifold',
  state: 'ACTIVE',
  isFixture: true,
  styleTags: ['minimalist', 'japandi'],
  colourTags: ['ivory', 'sand'],
  variants: [
    {
      id: 'var-komorebi-trifold',
      productId: 'prod-komorebi-03',
      shape: 'TRIFOLD',
      availability: 'UNAVAILABLE',
      priceRules: [],
    },
  ],
}

// Inactive / Archived Product
export const PRODUCT_ARCHIVED: TestProduct = {
  id: 'prod-archived-99',
  slug: 'archived-collection-99',
  name: 'Bộ Sưu Tập Lưu Trữ 2024',
  state: 'ARCHIVED',
  isFixture: true,
  styleTags: ['vintage'],
  colourTags: ['brown'],
  variants: [
    {
      id: 'var-archived-flat',
      productId: 'prod-archived-99',
      shape: 'FLAT',
      availability: 'AVAILABLE',
      priceRules: [
        {
          id: 'rule-archived-t1',
          variantId: 'var-archived-flat',
          quantityMin: 1,
          quantityMax: 100,
          unitAmountVnd: 20000n,
          setupAmountVnd: 0n,
        },
      ],
    },
  ],
}

export const TEST_CATALOGUE_FIXTURES: TestProduct[] = [
  PRODUCT_SONG_HY,
  PRODUCT_DUYEN_KHOI_QUOTE,
  PRODUCT_KOMOREBI_TRIFOLD,
  PRODUCT_ARCHIVED,
]
