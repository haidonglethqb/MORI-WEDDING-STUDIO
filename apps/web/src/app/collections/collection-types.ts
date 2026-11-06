import { BESPOKE_PROFILES } from './collection-catalog-data'
import type { MoriIconName } from '../../components/mori-icon'

export type StyleCategoryId = 'editorial' | 'floral' | 'heritage' | 'minimalist' | 'modern'

export interface CollectionCategory {
  id: StyleCategoryId
  title: string
  subtitle: string
  badge: string
  accentColor: string
  icon: MoriIconName
}

export interface CollectionItem {
  slug: string
  skuName: string
  curatedTitle: string
  curatedDesc: string
  categoryId: StyleCategoryId
  categoryLabel: string
  shape: 'BIFOLD' | 'FLAT' | 'TRIFOLD'
  minPriceVnd: string | null
  isFixture: boolean
}

export const COLLECTION_CATEGORIES: CollectionCategory[] = [
  {
    id: 'editorial',
    title: 'Bộ sưu tập Editorial Vogue',
    subtitle: 'Bố cục thanh lịch, tương phản rõ và nhiều khoảng thở.',
    badge: 'Thanh lịch',
    accentColor: '#b38e46',
    icon: 'spark',
  },
  {
    id: 'floral',
    title: 'Bộ sưu tập Floral Botanical',
    subtitle: 'Họa tiết lấy cảm hứng từ thiên nhiên với nét mềm mại.',
    badge: 'Cảm hứng thiên nhiên',
    accentColor: '#4d6345',
    icon: 'leaf',
  },
  {
    id: 'heritage',
    title: 'Bộ sưu tập Heritage Á Đông',
    subtitle: 'Họa tiết và bố cục gợi nhắc nét văn hóa Á Đông.',
    badge: 'Á Đông',
    accentColor: '#8a241f',
    icon: 'heart',
  },
  {
    id: 'minimalist',
    title: 'Bộ sưu tập Minimalist Japandi',
    subtitle: 'Đường nét gọn gàng, màu sắc tiết chế và nhịp điệu cân bằng.',
    badge: 'Tinh giản',
    accentColor: '#5c6456',
    icon: 'paper',
  },
  {
    id: 'modern',
    title: 'Bộ sưu tập Modern Calligraphy',
    subtitle: 'Kiểu chữ giàu cá tính kết hợp cùng bố cục phóng khoáng.',
    badge: 'Thư pháp',
    accentColor: '#9c6644',
    icon: 'palette',
  },
]

export function getPreviewCoupleName(): string {
  return 'Tên cô dâu & chú rể'
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
  raw: { slug: string; name: string; shape: 'BIFOLD' | 'FLAT' | 'TRIFOLD'; minPriceVnd: string | null; isFixture: boolean },
): CollectionItem {
  const categoryId = resolveCategoryId(raw.slug)
  const cat = COLLECTION_CATEGORIES.find((c) => c.id === categoryId)
  const categoryLabel = cat?.title.replace('Bộ sưu tập ', '') ?? 'Nghệ nhân'
  const profile = BESPOKE_PROFILES[raw.slug]

  return {
    slug: raw.slug,
    skuName: raw.name,
    curatedTitle: raw.isFixture ? profile?.title ?? raw.name : raw.name,
    curatedDesc: raw.isFixture
      ? 'Mẫu minh họa để tham khảo phong cách và bố cục.'
      : 'Xem thông tin quy cách hiện có trên trang chi tiết.',
    categoryId,
    categoryLabel,
    shape: raw.shape,
    minPriceVnd: raw.minPriceVnd,
    isFixture: raw.isFixture,
  }
}
