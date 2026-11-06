import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import { PortalHero } from './portal-hero'
import { PortalDeck } from './portal-deck'
import { type ShowcaseProduct } from './sample-showcase'
import { HomeFooter } from './home-footer'
import './home.css'
import './collections/collections.css'
import './landing-editorial.css'
import './landing-responsive.css'
import './portal-fonts.css'
import './portal-landing.css'
import './portal-responsive.css'
import './portal-reviews.css'

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
    <div className="home home-editorial portal-home">
      <a className="landing-skip" href="#landing-main">Đến nội dung chính</a>
      <HomeNav />
      <main id="landing-main">
        <PortalHero />
        <section className="portal-statement" id="che-tac"><span className="portal-kicker">01 / MỘT LỜI MỜI</span><h2>Có những câu chuyện bắt đầu bằng <em>một tấm thiệp.</em></h2><p>Từ những nét chữ đầu tiên đến lời mời gửi trao, MORI đồng hành cùng hai bạn tạo nên một dấu ấn riêng cho ngày chung đôi.</p><span className="portal-outline" aria-hidden="true">01</span></section>
        <section className="portal-releases" id="bo-suu-tap"><div className="portal-release-copy"><span className="portal-kicker">02 / BỘ SƯU TẬP</span><h2>Mỗi thiết kế.<br /><em>Một câu chuyện.</em></h2><p>Tìm cảm hứng từ những mẫu thiệp có sẵn, rồi cùng MORI hoàn thiện lời mời của hai bạn.</p><div className="portal-actions"><a className="portal-button" href="/collections">Khám phá bộ sưu tập ↗</a><a className="portal-link" href="/assistant">Cùng tìm ý tưởng →</a></div></div><PortalDeck products={products} /></section>
        <section className="portal-roster" id="thiep-so"><div className="portal-section-top"><span className="portal-kicker">03 / CÙNG MORI</span><h2>Chọn cách<br />kể chuyện.</h2></div><a href="/collections"><span>01 / THIẾT KẾ</span><strong>Thiệp cưới</strong><span>KHÁM PHÁ ↗</span></a><a href="/workspace"><span>02 / TRỰC TUYẾN</span><strong>Thiệp số & RSVP</strong><span>BẮT ĐẦU ↗</span></a><a href="/assistant"><span>03 / CẢM HỨNG</span><strong>Trợ lý gợi ý</strong><span>TRÒ CHUYỆN ↗</span></a></section>
        <section className="portal-process" id="quy-trinh"><div><span className="portal-kicker">04 / TỪ Ý TƯỞNG ĐẾN NGÀY VUI</span><h2>Từng bước,<br /><em>cùng hai bạn.</em></h2></div><div className="portal-process-rows"><div><span>01</span><strong>Chọn hướng thiết kế</strong><p>Khám phá mẫu hoặc trò chuyện cùng trợ lý.</p></div><div><span>02</span><strong>Hoàn thiện chi tiết</strong><p>Trao đổi nội dung, số lượng và quy cách cùng xưởng.</p></div><div><span>03</span><strong>Duyệt trước khi gửi</strong><p>Kiểm tra thông tin và theo dõi các bước tiếp theo.</p></div></div></section>
        <section className="portal-reviews" id="nhan-xet"><span className="portal-kicker">05 / LỜI NHẮN TỪ KHÁCH HÀNG</span><h2>Những câu chuyện<br /><em>được sẻ chia.</em></h2><p>Nhận xét sẽ được đăng khi khách hàng cung cấp và đồng ý chia sẻ.</p><a href="/assistant">Trò chuyện cùng MORI ↗</a></section><section className="portal-close"><span className="portal-kicker">MORI / WEDDING STUDIO</span><div><h2>Ngày vui bắt đầu<br />từ <em>một lời mời.</em></h2><div className="portal-actions"><a className="portal-button" href="/collections">Tìm mẫu thiệp ↗</a><a className="portal-link" href="/workspace">Không gian của bạn →</a></div></div><p>THIỆP GIẤY & THIỆP TRỰC TUYẾN · THIẾT KẾ THEO CÂU CHUYỆN CỦA BẠN</p><div className="portal-close-mark" aria-hidden="true">MORI<span>.</span></div></section>
      </main>
      <HomeFooter />
    </div>
  )
}
