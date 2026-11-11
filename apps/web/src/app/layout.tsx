import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './portal-fonts.css'
import './mori-interface.css'

export const metadata: Metadata = {
  title: 'MORI Wedding Studio · Xưởng thiệp cưới giấy ngà',
  description: 'Thiệp cưới in trên giấy ngà, sắp riêng từng cặp. Thiết kế thủ công và thiệp số cá nhân hoá.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      style={{
        ['--font-serif' as string]: '"Lora", Georgia, serif',
        ['--font-sans' as string]: '"Sora", sans-serif',
      }}
    >
      <body>{children}</body>
    </html>
  )
}
