import type { FaqCategoryId } from './faq-types'

const CATEGORY_PATHS: Record<FaqCategoryId, string> = {
  products: 'M4 7l8-4 8 4-8 4-8-4Zm0 5l8 4 8-4M4 17l8 4 8-4',
  design: 'm14 4 6 6-10 10H4v-6L14 4Zm-2.5 5.5 3 3',
  online: 'M3 5h18v11H3V5Zm6 14h6m-3-3v3',
  orders: 'M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6Zm-7.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  aftercare: 'M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4m-16 0v4a2 2 0 0 0 2 2h2v-6H4',
}

export function FaqCategoryIcon({ id }: { id: FaqCategoryId }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={CATEGORY_PATHS[id]} />
    </svg>
  )
}
