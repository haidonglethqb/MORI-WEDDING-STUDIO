import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import { HeroShowcase } from './hero-showcase'
import { HeroTrustBar } from './hero-trust-bar'
import { CraftMaterials } from './craft-materials'
import { SampleShowcase, type ShowcaseProduct } from './sample-showcase'
import { DigitalRsvpShowcase } from './digital-rsvp-showcase'
import { WeddingEstimator } from './wedding-estimator'
import { HomeSteps } from './home-steps'
import { HomeStories } from './home-stories'
import { HomeFaq } from './home-faq'
import { HomeFooter } from './home-footer'
import './home.css'
import './collections/collections.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

function resolveStyleCategory(slug: string): string {
  if (slug.includes('editorial')) return 'Editorial Vogue'
  if (slug.includes('floral')) return 'Floral Botanical'
  if (slug.includes('minimalist')) return 'Minimalist Japandi'
  if (slug.includes('typography') || slug.includes('calligraphy')) return 'Modern Calligraphy'
  if (slug.includes('traditional') || slug.includes('heritage')) return 'Heritage Á Đông'
  return 'Artisan Bespoke'
}

async function loadProducts(): Promise<ShowcaseProduct[]> {
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/catalog/products`, { cache: 'no-store' })
    if (!response.ok) return []
    const products = (await response.json()) as CatalogueProduct[]
    return products
      .filter((p) => p.variants.some((v) => v.availability !== 'UNAVAILABLE'))
      .slice(0, 12)
      .map((p) => {
        const orderable = p.variants.filter((v) => v.availability !== 'UNAVAILABLE')
        const bifold = orderable.some((v) => v.shape === 'BIFOLD')
        const minPrice = orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd ?? '35000'
        return {
          slug: p.slug,
          name: p.name,
          styleCategory: resolveStyleCategory(p.slug),
          shape: bifold ? 'BIFOLD' : 'FLAT',
          priceVnd: minPrice,
          badge: bifold ? 'Gấp đôi' : 'Dạng phẳng',
        }
      })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const showcaseProducts = await loadProducts()

  return (
    <div className="home">
      <HomeNav />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-eyebrow-pill">
            <span className="shimmer-dot">✦</span>
            <span>ATELIER THIỆP CƯỚI NGHỆ NHÂN CAO CẤP</span>
            <span className="shimmer-dot">✦</span>
          </div>
          <h1>Thiệp cưới in trên giấy ngà, sắp riêng từng cặp đôi.</h1>
          <p className="hero-lead-text">
            Khởi đầu hành trình chung đôi bằng xúc cảm tự nhiên từ sợi bã mía 350gsm, kỹ thuật ép kim chìm nhiệt cao
            và trang thiệp cưới số tương tác RSVP đồng bộ độc bản cho từng vị khách quý.
          </p>
          <div className="home-actions">
            <a className="home-cta" href="/collections">
              Khám phá bộ sưu tập 2026
            </a>
            <a className="home-quiet" href="#thiep-so">
              Trải nghiệm thiệp số &rarr;
            </a>
          </div>
          <HeroTrustBar />
        </div>

        <HeroShowcase />
      </section>

      {/* Collection Gallery */}
      <section className="home-band" id="bo-suu-tap">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Catalogue Atelier 2026</span>
          <h2>Các thiết kế sẵn sàng may đo</h2>
          <p className="section-subtitle">
            Mỗi tác phẩm đều có thể xoay mô hình 3D tương tác đa chiều trước khi duyệt in và hoàn thiện thủ công.
          </p>
        </div>
        <SampleShowcase products={showcaseProducts} />
      </section>

      {/* Material & Craftsmanship Explorer */}
      <section className="home-band" id="che-tac">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Nghệ thuật Sợi giấy &amp; Dập kim</span>
          <h2>Xúc cảm thủ công &amp; Dấu ấn độc bản</h2>
          <p className="section-subtitle">
            Khám phá 4 kỹ nghệ tinh hoa tạo nên sự sang trọng và giá trị lưu niệm vượt thời gian của MORI.
          </p>
        </div>
        <CraftMaterials />
      </section>

      {/* Digital RSVP Interactive Smartphone Showcase */}
      <section className="home-band-dark" id="thiep-so">
        <div className="band-dark-inner">
          <DigitalRsvpShowcase />
        </div>
      </section>

      {/* Wedding Suite Cost Estimator */}
      <section className="home-band" id="du-toan">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Minh bạch &amp; Chu đáo</span>
          <h2>Dự toán chi phí bộ thiệp cưới</h2>
          <p className="section-subtitle">
            Ước tính ngân sách nhanh chóng theo số lượng và quy cách hoàn thiện thực tế của bạn.
          </p>
        </div>
        <WeddingEstimator />
      </section>

      {/* 4 Steps Journey */}
      <section className="home-steps" id="quy-trinh">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Hành trình trải nghiệm</span>
          <h2>Bốn bước may đo cùng MORI</h2>
          <p className="section-subtitle">Quy trình rõ ràng giúp cô dâu chú rể an tâm trong từng khoảnh khắc chuẩn bị.</p>
        </div>
        <HomeSteps />
      </section>

      {/* Real Love Stories */}
      <section className="home-band" id="cau-chuyen">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Hạnh phúc lan tỏa</span>
          <h2>Lời nhắn gửi từ những cặp đôi</h2>
          <p className="section-subtitle">Những trải nghiệm chân thật từ các cô dâu chú rể đã đồng hành cùng MORI.</p>
        </div>
        <HomeStories />
      </section>

      {/* Atelier FAQ */}
      <section className="home-band" id="faq">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Giải đáp thắc mắc</span>
          <h2>Những câu hỏi thường gặp</h2>
          <p className="section-subtitle">Tất cả những điều bạn cần biết trước khi đặt may đo thiệp cưới tại MORI.</p>
        </div>
        <HomeFaq />
      </section>

      <HomeFooter />
    </div>
  )
}
