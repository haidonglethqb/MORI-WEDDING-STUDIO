const PRODUCT_IMAGE_FOLDERS = {
  editorial: 'editorial',
  floral: 'floral',
  traditional: 'heritage',
  minimalist: 'minimalist',
  typography: 'modern-calligraphy',
} as const

type ProductStyleKey = keyof typeof PRODUCT_IMAGE_FOLDERS

const PRODUCT_SLUG_RE =
  /^(editorial|floral|traditional|minimalist|typography)-(flat|bifold)-(0[1-5])$/

export function getProductImageUrl(slug: string): string | null {
  const match = PRODUCT_SLUG_RE.exec(slug.trim().toLowerCase())
  if (!match) return null
  const styleKey = match[1] as ProductStyleKey
  const folder = PRODUCT_IMAGE_FOLDERS[styleKey]
  return `/images/products/${folder}/${match[0]}.jpg`
}

export function resolveProductImageUrl(
  product: { imageUrl?: string | null } | null | undefined,
  slug: string,
): string | null {
  return product?.imageUrl ?? getProductImageUrl(slug)
}
