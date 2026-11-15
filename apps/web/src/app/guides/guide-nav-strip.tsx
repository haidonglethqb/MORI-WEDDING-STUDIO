import Link from 'next/link'

export type SupportGuideKey =
  | 'order-process'
  | 'online-ordering'
  | 'order-tracking'
  | 'faq'
  | 'fonts'

const SUPPORT_LINKS: Array<{ key: SupportGuideKey; label: string; href: string }> = [
  { key: 'order-process', label: 'Quy trình đặt & nhận thiệp', href: '/guides/order-process' },
  { key: 'online-ordering', label: 'Hướng dẫn đặt hàng online', href: '/guides/online-ordering' },
  { key: 'order-tracking', label: 'Kiểm tra đơn hàng', href: '/order-tracking' },
  { key: 'faq', label: 'Các câu hỏi thường gặp', href: '/faq' },
  { key: 'fonts', label: 'Bảng font chữ thiệp cưới', href: '/fonts' },
]

export function GuideNavStrip({ active }: { active: SupportGuideKey }) {
  return (
    <nav className="guide-subnav" aria-label="Hướng dẫn và hỗ trợ MORI">
      {SUPPORT_LINKS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`guide-subnav-link ${active === item.key ? 'is-active' : ''}`}
          aria-current={active === item.key ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
