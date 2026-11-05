import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'MORI Wedding Studio · Xưởng thiệp cưới giấy ngà',
  description: 'Thiệp cưới in trên giấy ngà, sắp riêng từng cặp. Thiết kế thủ công và thiệp số cá nhân hoá.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      style={{
        ['--font-serif' as string]: '"Lora", "Cormorant Garamond", Georgia, serif',
        ['--font-sans' as string]: '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
