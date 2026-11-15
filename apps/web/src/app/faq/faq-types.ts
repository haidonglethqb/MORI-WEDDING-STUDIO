export type FaqCategoryId =
  | 'products'
  | 'design'
  | 'online'
  | 'orders'
  | 'aftercare'

export interface FaqItem {
  number: number
  question: string
  answers: string[]
  bullets?: string[]
}

export interface FaqCategory {
  id: FaqCategoryId
  title: string
  items: FaqItem[]
}
