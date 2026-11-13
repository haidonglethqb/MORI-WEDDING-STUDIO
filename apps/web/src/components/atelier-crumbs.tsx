import Link from 'next/link'

export interface AtelierCrumb {
  label: string
  href?: string
}

/** Breadcrumb trail rendered inside the ink header band of work pages. */
export function AtelierCrumbs({ items }: { items: AtelierCrumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="atelier-crumbs">
      <ol>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
