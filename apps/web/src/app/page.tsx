import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import { HeroShowcase } from './hero-showcase'
import { CraftMaterials } from './craft-materials'
import { SampleShowcase, type ShowcaseProduct } from './sample-showcase'
import { DigitalRsvpShowcase } from './digital-rsvp-showcase'
import { HomeSteps } from './home-steps'
import { HomeFaq } from './home-faq'
import { HomeFooter } from './home-footer'
import './home.css'
import './collections/collections.css'
import './landing-editorial.css'
import './landing-responsive.css'

export const dynamic = 'force-dynamic'

async function loadProducts(): Promise<ShowcaseProduct[]> {
  try {
    const origin = process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
    const response = await fetch(`${origin}/api/v1/catalog/products`, { cache: 'no-store' })
    if (!response.ok) return []
    const products = (await response.json()) as CatalogueProduct[]
    return products.filter((p) => p.variants.some((v) => v.availability !== 'UNAVAILABLE'))
      .slice(0, 4).map((p) => {
        const variants = p.variants.filter((v) => v.availability !== 'UNAVAILABLE')
        const prices = variants.flatMap((v) => v.unitAmountVnd === null ? [] : [BigInt(v.unitAmountVnd)])
        const minimum = prices.reduce<bigint | null>((min, value) => min === null || value < min ? value : min, null)
        return { slug: p.slug, name: p.name, shape: variants[0]?.shape ?? 'FLAT', priceVnd: minimum?.toString() ?? null, isFixture: p.isFixture }
      })
  } catch { return [] }
}

export default async function HomePage() {
  const products = await loadProducts()
  return (
    <div className="home home-editorial">
      <a className="landing-skip" href="#landing-main">Đến nội dung chính</a>
      <HomeNav />
      <main id="landing-main">
        <section className="home-hero" aria-labelledby="landing-title">
          <div className="hero-content">
            <p className="landing-eyebrow"><span className="landing-hairline" /> MORI WEDDING STUDIO</p>
            <h1 id="landing-title">Ngày chung đôi.<br /><em>Một lời mời</em><br />rất riêng.</h1>
            <p className="hero-lead-text">Trước khi ngày vui bắt đầu, hãy để tấm thiệp kể đôi điều về hai bạn.</p>
            <div className="home-actions">
              <a className="home-cta" href="/collections">Tìm mẫu thiệp của bạn <span aria-hidden="true">↗</span></a>
              <a className="home-quiet" href="#che-tac">Gặp tinh thần MORI</a>
            </div>
            <div className="hero-editor-note"><span>THIỆP GIẤY & THIỆP TRỰC TUYẾN</span><p>Từ nét chữ đầu tiên đến lời mời được gửi đi.</p></div>
          </div>
          <HeroShowcase />
        </section>
        <div className="landing-colophon"><span>Một lời mời. Một dấu ấn.</span><span>ĐƯỢC SẮP RIÊNG CHO HAI BẠN</span><a href="#bo-suu-tap">Khám phá bên dưới <span aria-hidden="true">↓</span></a></div>
        <section className="home-band landing-selection" id="bo-suu-tap" aria-labelledby="collection-heading">
          <div className="landing-section-heading"><div><span className="landing-eyebrow">01 / BỘ SƯU TẬP</span><h2 id="collection-heading">Bắt đầu từ<br /><em>một rung động.</em></h2></div><div><p>Một nét tối giản, một sắc màu quen, hay chút lãng mạn. Chọn thiết kế khiến bạn thấy mình trong đó.</p><a className="landing-text-link" href="/collections">Xem toàn bộ bộ sưu tập <span aria-hidden="true">↗</span></a></div></div>
          <SampleShowcase products={products} />
        </section>
        <section className="home-band landing-craft" id="che-tac" aria-labelledby="craft-heading">
          <div className="landing-section-heading"><div><span className="landing-eyebrow">02 / DẤU ẤN RIÊNG</span><h2 id="craft-heading">Đẹp từ những điều<br /><em>thật nhỏ.</em></h2></div><p>Tên hai bạn, một tông màu, cách đặt lời mời. Những chi tiết nhỏ làm nên một tấm thiệp có cá tính.</p></div>
          <CraftMaterials />
        </section>
        <section className="home-band-dark" id="thiep-so"><div className="band-dark-inner"><DigitalRsvpShowcase /></div></section>
        <section className="home-steps" id="quy-trinh" aria-labelledby="process-heading">
          <div className="landing-section-heading"><div><span className="landing-eyebrow">04 / CÙNG MORI</span><h2 id="process-heading">Từng bước,<br /><em>cùng hai bạn.</em></h2></div><p>Không cần có sẵn mọi câu trả lời. Hãy bắt đầu với một ý tưởng, phần còn lại mình cùng trao đổi.</p></div>
          <HomeSteps />
        </section>
        <section className="home-band landing-faq" id="faq" aria-labelledby="faq-heading"><div><span className="landing-eyebrow">TRƯỚC KHI BẮT ĐẦU</span><h2 id="faq-heading">Có thể bạn<br /><em>đang băn khoăn.</em></h2><p>Thông tin giúp bạn dễ dàng chọn bước tiếp theo.</p></div><HomeFaq /></section>
        <section className="landing-invitation" id="du-toan"><span className="landing-eyebrow">MORI · WEDDING STUDIO</span><h2>Mọi ngày vui đều bắt đầu<br />từ <em>một lời mời.</em></h2><a className="home-cta" href="/collections">Tìm thiết kế dành cho hai bạn <span aria-hidden="true">↗</span></a><a className="landing-text-link" href="/assistant">Chưa biết chọn gì? Cùng tìm ý tưởng</a></section>
      </main>
      <HomeFooter />
    </div>
  )
}
