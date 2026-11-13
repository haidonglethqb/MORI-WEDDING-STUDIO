const PRODUCT_IMAGE_FOLDERS: Record<string, string> = {
  editorial: 'editorial',
  floral: 'floral',
  traditional: 'heritage',
  minimalist: 'minimalist',
  typography: 'modern-calligraphy',
}

const PAPER_PRODUCT_SLUG_RE =
  /^(editorial|floral|traditional|minimalist|typography)-(flat|bifold)-0[1-5]$/

export function getProductImageUrl(slug: string): string | null {
  const match = PAPER_PRODUCT_SLUG_RE.exec(slug)
  if (!match) return null
  const folder = PRODUCT_IMAGE_FOLDERS[match[1] ?? '']
  return folder ? `/images/products/${folder}/${slug}.jpg` : null
}

export function resolveProductImageUrl(item: {
  slug: string
  imageUrl?: string | null | undefined
}): string | null {
  const explicit = (item as { imageUrl?: string | null | undefined }).imageUrl
  return explicit ?? getProductImageUrl(item.slug)
}
