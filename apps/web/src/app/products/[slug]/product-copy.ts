interface CategoryCopyMeta {
  label: string
  description: string
}

const CATEGORY_COPY: Record<string, CategoryCopyMeta> = {
  editorial: {
    label: 'Editorial Vogue',
    description:
      'Bố cục tạp chí thanh lịch, tương phản rõ và nhiều khoảng thở trên nền giấy bã mía 350gsm.',
  },
  floral: {
    label: 'Floral Botanical',
    description:
      'Họa tiết thảo mộc nhẹ nhàng, sắc nét và dịu mắt trên chất liệu giấy mỹ thuật 350gsm.',
  },
  traditional: {
    label: 'Heritage Á Đông',
    description:
      'Cảm hứng văn hóa Á Đông trang trọng, cân bằng giữa nét truyền thống và hoàn thiện hiện đại.',
  },
  minimalist: {
    label: 'Minimalist Japandi',
    description:
      'Đường nét tinh giản, màu sắc tiết chế và tỷ lệ hài hòa trên nền giấy bã mía 350gsm.',
  },
  typography: {
    label: 'Modern Calligraphy',
    description:
      'Nghệ thuật sắp chữ giàu cá tính, tôn vinh tên hai bạn làm điểm nhấn trung tâm của tấm thiệp.',
  },
}

const SHAPE_LABELS: Record<string, string> = {
  FLAT: 'Dạng phẳng (Flat Card)',
  BIFOLD: 'Dạng gập đôi (Bi-fold)',
  TRIFOLD: 'Dạng gập ba (Tri-fold)',
  ARCH: 'Dạng vòm uốn cong (Arch)',
  DECKLE: 'Mép xé thủ công (Deckle Edge)',
}

const LEGACY_SEED_NAME_RE = /^Mori\s+\w+\s+(Phẳng|Gấp)\s+\d+$/i
const PRODUCT_SLUG_PARTS_RE =
  /^(editorial|floral|traditional|minimalist|typography)-(flat|bifold)-(\d{2})$/

export function getShapeLabel(shape: string): string {
  return SHAPE_LABELS[shape] ?? shape
}

export function resolveProductCopy(
  product: {
    slug: string
    name: string
    description?: string | null | undefined
    isFixture: boolean
  },
  profileTitle?: string,
  profileSubtitle?: string,
): { title: string; subtitle: string } {
  const match = PRODUCT_SLUG_PARTS_RE.exec(product.slug.trim().toLowerCase())
  const catKey = match?.[1]
  const catMeta = catKey ? CATEGORY_COPY[catKey] : undefined
  const shapeVn = match?.[2] === 'bifold' ? 'Gấp đôi' : 'Đơn phẳng'
  const fallbackTitle = catMeta
    ? `${catMeta.label} · ${shapeVn} ${match?.[3] ?? ''}`.trim()
    : product.name
  const fallbackSubtitle =
    catMeta?.description ??
    'Thiết kế độc bản trên nền giấy bã mía sinh thái 350gsm tại xưởng MORI.'

  let title: string
  if (product.isFixture || LEGACY_SEED_NAME_RE.test(product.name)) {
    title = profileTitle ?? fallbackTitle
  } else {
    title = product.name.trim() || profileTitle || fallbackTitle
  }

  const subtitle =
    product.description?.trim() || profileSubtitle || fallbackSubtitle

  return { title, subtitle }
}
