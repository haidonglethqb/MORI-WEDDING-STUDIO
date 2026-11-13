import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import { PortalHero } from './portal-hero'
import { PortalDeck } from './portal-deck'
import { PortalStatement } from './portal-statement'
import { PortalMaterial } from './portal-material'
import { PortalRoster } from './portal-roster'
import { PortalProcess } from './portal-process'
import { PortalJournal } from './portal-journal'
import { PortalClose } from './portal-close'
import { type ShowcaseProduct } from './sample-showcase'
import { resolveCategoryId } from './collections/collection-types'
import { HomeFooter } from './home-footer'
import './home.css'
import './collections/collections.css'
import './landing-editorial.css'
import './landing-responsive.css'
import './portal-fonts.css'
import './portal-landing.css'
import './portal-responsive.css'
import './portal-reviews.css'
import './portal-editorial.css'
import './portal-editorial-responsive.css'
import './portal-journal.css'
import './portal-motion.css'

export const dynamic = 'force-dynamic'

function pickDiverseShowcase(products: CatalogueProduct[]): CatalogueProduct[] {
  const seen = new Set<string>()
  const picked: CatalogueProduct[] = []
  for (const product of products) {
    const category = resolveCategoryId(product.slug)
    if (!seen.has(category)) {
      seen.add(category)
      picked.push(product)
    }
  }
  for (const product of products) {
    if (picked.length >= 5) break
    if (!picked.includes(product)) picked.push(product)
  }
  return picked.slice(0, 5)
}

async function loadProducts(): Promise<ShowcaseProduct[]> {
  try {
    const origin = process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
    const response = await fetch(`${origin}/api/v1/catalog/products`, { cache: 'no-store' })
    if (!response.ok) return []
    const products = (await response.json()) as CatalogueProduct[]
    const active = products.filter((p) => p.variants.some((v) => v.availability !== 'UNAVAILABLE'))
    return pickDiverseShowcase(active).map((p) => {
      const variants = p.variants.filter((v) => v.availability !== 'UNAVAILABLE')
      const prices = variants.flatMap((v) => (v.unitAmountVnd === null ? [] : [BigInt(v.unitAmountVnd)]))
      const minimum = prices.reduce<bigint | null>((min, value) => (min === null || value < min ? value : min), null)
      return {
        slug: p.slug,
        name: p.name,
        shape: variants[0]?.shape ?? 'FLAT',
        priceVnd: minimum?.toString() ?? null,
        isFixture: p.isFixture,
      }
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await loadProducts()
  return (
    <div className="home home-editorial portal-home">
      <div className="portal-scroll-progress" aria-hidden="true" />
      <a className="landing-skip" href="#landing-main">Đến nội dung chính</a>
      <HomeNav />
      <main id="landing-main">
        <PortalHero />
        <PortalStatement />
        <section className="portal-releases" id="bo-suu-tap" aria-labelledby="releases-title">
          <div className="portal-release-copy" data-reveal>
            <span className="portal-kicker">02 / BỘ SƯU TẬP</span>
            <h2 id="releases-title">Mỗi thiết kế.<br /><em>Một câu chuyện.</em></h2>
            <p>Tìm cảm hứng từ những mẫu thiệp có sẵn, rồi cùng MORI hoàn thiện lời mời của hai bạn.</p>
            <div className="portal-actions">
              <a className="portal-button" href="/collections">Khám phá bộ sưu tập ↗</a>
              <a className="portal-link" href="/assistant">Cùng tìm ý tưởng →</a>
            </div>
          </div>
          <PortalDeck products={products} />
        </section>
        <PortalMaterial />
        <PortalRoster />
        <PortalProcess />
        <PortalJournal />
        <section className="portal-reviews" id="nhan-xet" aria-labelledby="reviews-title" data-reveal>
          <span className="portal-kicker">07 / LỜI NHẮN TỪ KHÁCH HÀNG</span>
          <h2 id="reviews-title">Những câu chuyện<br /><em>được sẻ chia.</em></h2>
          <p>Nhận xét sẽ được đăng khi khách hàng cung cấp và đồng ý chia sẻ.</p>
          <a href="/assistant">Trò chuyện cùng MORI ↗</a>
        </section>
        <PortalClose />
      </main>
      <HomeFooter />
    </div>
  )
}
