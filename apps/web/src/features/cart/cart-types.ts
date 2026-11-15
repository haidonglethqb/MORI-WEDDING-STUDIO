export type CartProductType = 'PAPER' | 'DIGITAL' | 'COMBO'

export interface CartItem {
  id: string
  slug: string
  name: string
  productType: CartProductType
  shape: string
  quantity: number
  unitAmountVnd: number
  imageUrl?: string | null | undefined
  linkedDigitalSlug?: string | undefined
  linkedDigitalName?: string | undefined
  linkedDigitalUnitVnd?: number | undefined
  fontCode?: string | undefined
}

export interface CartTotals {
  subtotalVnd: number
  discountVnd: number
  totalVnd: number
  hasComboDiscount: boolean
  totalCount: number
}

export interface SelectedFontInfo {
  code: string
  name: string
}

export interface DigitalTemplateMeta {
  slug: string
  name: string
  styleLabel: string
  description: string
  unitAmountVnd: number
  accentColor: string
  badgeLabel: string
}

export const DIGITAL_CATALOG_ITEMS: readonly DigitalTemplateMeta[] = [
  {
    slug: 'minimalist-digital-01',
    name: 'Digital Zen Minimal',
    styleLabel: 'Minimalist Japandi',
    description: 'Thiệp website tối giản tinh khôi với lịch trình và nút xác nhận RSVP nhanh gọn.',
    unitAmountVnd: 399_000,
    accentColor: '#5c6456',
    badgeLabel: 'Tối giản',
  },
  {
    slug: 'floral-digital-01',
    name: 'Digital Floral Garden',
    styleLabel: 'Floral Botanical',
    description: 'Sắc hoa thảo mộc dịu dàng, kèm bản đồ chỉ đường và đếm ngược ngày chung đôi.',
    unitAmountVnd: 449_000,
    accentColor: '#4d6345',
    badgeLabel: 'Thảo mộc',
  },
  {
    slug: 'typography-digital-01',
    name: 'Digital Calligraphy',
    styleLabel: 'Modern Calligraphy',
    description: 'Nét chữ thư pháp bay bổng tối ưu hiển thị trên di động khi gửi qua ứng dụng nhắn tin.',
    unitAmountVnd: 499_000,
    accentColor: '#9c6644',
    badgeLabel: 'Thư pháp',
  },
  {
    slug: 'traditional-digital-01',
    name: 'Digital Song Hỷ Hoàng Gia',
    styleLabel: 'Heritage Á Đông',
    description: 'Họa tiết Song Hỷ Á Đông trang trọng kết hợp thiệp mời online và sổ lời chúc.',
    unitAmountVnd: 549_000,
    accentColor: '#8a241f',
    badgeLabel: 'Á Đông',
  },
  {
    slug: 'editorial-digital-01',
    name: 'Digital Vogue Luxe',
    styleLabel: 'Editorial Vogue',
    description: 'Bố cục tạp chí thời trang cao cấp với album ảnh cưới, đếm ngược và RSVP thông minh.',
    unitAmountVnd: 599_000,
    accentColor: '#8e7338',
    badgeLabel: 'Editorial',
  },
]

export function getDigitalMeta(slug: string): DigitalTemplateMeta | undefined {
  return DIGITAL_CATALOG_ITEMS.find((item) => item.slug === slug)
}

export function resolveDigitalPriceVnd(
  slug: string,
  apiUnitAmount?: string | number | null,
): number {
  const numeric = apiUnitAmount !== undefined && apiUnitAmount !== null ? Number(apiUnitAmount) : 0
  if (Number.isFinite(numeric) && numeric > 0) return Math.round(numeric)
  return getDigitalMeta(slug)?.unitAmountVnd ?? 499_000
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`
}

export function formatShapeLabel(shape: string): string {
  if (shape === 'BIFOLD') return 'Khổ gấp đôi'
  if (shape === 'TRIFOLD') return 'Khổ gấp ba'
  if (shape === 'DIGITAL' || shape === 'ONLINE') return 'Website thiệp online'
  return 'Khổ đơn phẳng'
}
