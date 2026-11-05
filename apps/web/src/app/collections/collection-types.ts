import { BESPOKE_PROFILES } from './collection-catalog-data'

export type StyleCategoryId = 'editorial' | 'floral' | 'heritage' | 'minimalist' | 'modern'

export interface CollectionCategory {
  id: StyleCategoryId
  title: string
  subtitle: string
  badge: string
  accentColor: string
  icon: string
}

export interface CollectionItem {
  slug: string
  skuName: string
  curatedTitle: string
  curatedDesc: string
  categoryId: StyleCategoryId
  categoryLabel: string
  shape: 'BIFOLD' | 'FLAT' | 'TRIFOLD'
  minPriceVnd: string
  sampleCouple: string
  sampleDate: string
}

export const COLLECTION_CATEGORIES: CollectionCategory[] = [
  {
    id: 'editorial',
    title: 'Bộ sưu tập Editorial Vogue',
    subtitle: 'Cảm hứng bìa tạp chí thời trang Paris, typography ấn tượng và khung viền nhũ kim sắc sảo.',
    badge: 'High Fashion & Luxe',
    accentColor: '#b38e46',
    icon: '✦',
  },
  {
    id: 'floral',
    title: 'Bộ sưu tập Floral Botanical',
    subtitle: 'Vườn thảo mộc mùa hạ, cành lá uốn lượn dập chìm trên nền giấy bã mía mộc mạc.',
    badge: 'Hữu cơ & Thảo mộc',
    accentColor: '#4d6345',
    icon: '❀',
  },
  {
    id: 'heritage',
    title: 'Bộ sưu tập Heritage Á Đông',
    subtitle: 'Sắc son chu sa cung đình, ép nhũ hoàng kim cùng con dấu song hỷ trường cửu.',
    badge: 'Cung đình & Cát tường',
    accentColor: '#8a241f',
    icon: '囍',
  },
  {
    id: 'minimalist',
    title: 'Bộ sưu tập Minimalist Japandi',
    subtitle: 'Vẻ đẹp Wabi-Sabi tinh giản, dập chìm không màu và tỷ lệ vàng tĩnh lặng.',
    badge: 'Tinh giản & Thiền định',
    accentColor: '#5c6456',
    icon: '✤',
  },
  {
    id: 'modern',
    title: 'Bộ sưu tập Modern Calligraphy',
    subtitle: 'Nét bút thư pháp lãng mạn, dải lụa mộc buông lơi và con dấu sáp thủ công.',
    badge: 'Thư pháp & Phóng khoáng',
    accentColor: '#9c6644',
    icon: '✒',
  },
]

const SAMPLE_COUPLES = [
  'Minh Sơn & Thảo Vy',
  'Hoàng Long & Khánh Linh',
  'Quốc Anh & Hà Phương',
  'Đức Duy & Mai Anh',
  'Gia Huy & Tuệ Mẫn',
  'Thanh Tùng & Ngọc Diệp',
  'Tuấn Kiệt & Quỳnh Chi',
  'Việt Hưng & Lan Hương',
]

const SLUG_COUPLE_OVERRIDES: Record<string, string> = {
  'traditional-bifold-02': 'Hoàng Long & Khánh Linh',
  'traditional-bifold-01': 'Minh Sơn & Thảo Vy',
  'editorial-bifold-01': 'Minh Sơn & Thảo Vy',
  'editorial-bifold-02': 'Hoàng Long & Khánh Linh',
  'editorial-flat-01': 'Quốc Anh & Hà Phương',
  'editorial-flat-02': 'Đức Duy & Mai Anh',
  'floral-bifold-01': 'Gia Huy & Tuệ Mẫn',
  'floral-bifold-02': 'Thanh Tùng & Ngọc Diệp',
  'floral-flat-01': 'Tuấn Kiệt & Quỳnh Chi',
  'floral-flat-02': 'Việt Hưng & Lan Hương',
  'traditional-flat-01': 'Minh Sơn & Thảo Vy',
  'traditional-flat-02': 'Hoàng Long & Khánh Linh',
}

export function resolveSampleCouple(slug: string, fallbackIdx = 0): string {
  const override = SLUG_COUPLE_OVERRIDES[slug]
  if (override) return override
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash << 5) - hash + slug.charCodeAt(i)
  const idx = Math.abs(hash + fallbackIdx) % SAMPLE_COUPLES.length
  return SAMPLE_COUPLES[idx] ?? 'Minh Sơn & Thảo Vy'
}

export function resolveCategoryId(slug: string): StyleCategoryId {
  const s = slug.toLowerCase()
  if (s.includes('floral')) return 'floral'
  if (s.includes('traditional') || s.includes('storefront')) return 'heritage'
  if (s.includes('minimalist')) return 'minimalist'
  if (s.includes('typography') || s.includes('modern') || s.includes('fixture')) return 'modern'
  return 'editorial'
}

export function buildCuratedItem(
  raw: { slug: string; name: string; shape: 'BIFOLD' | 'FLAT' | 'TRIFOLD'; minPriceVnd: string | null },
  index: number,
): CollectionItem {
  const categoryId = resolveCategoryId(raw.slug)
  const cat = COLLECTION_CATEGORIES.find((c) => c.id === categoryId)
  const categoryLabel = cat?.title.replace('Bộ sưu tập ', '') ?? 'Nghệ nhân'
  const profile = BESPOKE_PROFILES[raw.slug]

  return {
    slug: raw.slug,
    skuName: raw.name,
    curatedTitle: profile?.title ?? raw.name,
    curatedDesc: profile?.subtitle ?? 'Ấn phẩm chế tác thủ công trên giấy bã mía 350gsm',
    categoryId,
    categoryLabel,
    shape: raw.shape,
    minPriceVnd: raw.minPriceVnd ?? '25000',
    sampleCouple: resolveSampleCouple(raw.slug, index),
    sampleDate: 'Tháng 12 · 2026 · Hà Nội',
  }
}
