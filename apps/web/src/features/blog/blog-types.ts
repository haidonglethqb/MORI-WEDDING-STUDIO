export type BlogCategoryId = 'material' | 'style' | 'personalize' | 'story'

export interface BlogCategoryMeta {
  id: BlogCategoryId
  label: string
  kicker: string
  description: string
}

export interface BlogImageAsset {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
}

export type BlogBlock =
  | { type: 'heading'; id: string; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'image'; image: BlogImageAsset }
  | { type: 'callout'; label: string; text: string }
  | { type: 'checklist'; title?: string; items: string[] }

export interface BlogCta {
  label: string
  href: string
  secondaryLabel?: string
  secondaryHref?: string
}

export interface BlogArticle {
  slug: string
  order: string
  category: BlogCategoryId
  categoryLabel: string
  title: string
  italicAccent?: string
  subtitle: string
  excerpt: string
  readMinutes: number
  publishedLabel: string
  cover: BlogImageAsset
  blocks: BlogBlock[]
  cta: BlogCta
}
