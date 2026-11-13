import type { ReactNode } from 'react'
import '../fonts.css'
import './blog-shared.css'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="blog-page">{children}</div>
}
