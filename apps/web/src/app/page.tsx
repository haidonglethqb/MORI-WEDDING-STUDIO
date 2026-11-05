import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import { HeroShowcase } from './hero-showcase'
import { CraftBento } from './craft-bento'
import { SampleShowcase, type ShowcaseProduct } from './sample-showcase'
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
  if (slug.includes('typography')) return 'Modern Calligraphy'
  if (slug.includes('traditional')) return 'Heritage Á Đông'
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
        const minPrice = orderable.find((v) => v.unitAmountVnd !== null)?.unitAmountVnd ?? '45000'
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
          <span className="hero-eyebrow">✦ Atelier Thiệp Cưới Cao Cấp ✦</span>
          <h1>Thiệp cưới in trên giấy ngà, sắp riêng từng cặp đôi.</h1>
          <p>
            Khởi đầu hành trình hạnh phúc bằng xúc cảm tự nhiên từ sợi bã mía 350gsm, kỹ thuật ép kim chìm nhiệt độ cao
            và trang thiệp cưới số tương tác RSVP đồng bộ độc bản.
          </p>
          <div className="home-actions">
            <a className="home-cta" href="/collections">
              Khám phá bộ sưu tập 2026
            </a>
            <a className="home-quiet" href="#thiep-so">
              Thiệp cưới số tương tác &rarr;
            </a>
          </div>
        </div>

        <HeroShowcase />
      </section>

      {/* Collection Gallery */}
      <section className="home-band" id="bo-suu-tap">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Catalogue 2026</span>
          <h2>Các mẫu thiết kế sẵn sàng may đo</h2>
          <p className="section-subtitle">
            Mỗi thiết kế đều hỗ trợ xem mô hình 3D tương tác đa chiều trước khi duyệt in và hoàn thiện thủ công.
          </p>
        </div>
        <SampleShowcase products={showcaseProducts} />
      </section>

      {/* Artisanal Bento Grid */}
      <section className="home-band" id="che-tac">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Nghệ thuật Thủ công</span>
          <h2>Xúc cảm sợi giấy &amp; Dấu ấn độc bản</h2>
          <p className="section-subtitle">
            Chúng tôi tỉ mỉ trong từng đường ép nhiệt, thớ giấy thực vật và trải nghiệm số tiện lợi của khách mời.
          </p>
        </div>
        <CraftBento />
      </section>

      {/* 3 Steps */}
      <section className="home-steps">
        <div className="section-title-wrap">
          <span className="section-eyebrow">Hành trình trải nghiệm</span>
          <h2>Ba bước đặt thiệp cùng MORI</h2>
          <p className="section-subtitle">Quy trình rõ ràng, minh bạch giúp cô dâu chú rể an tâm tuyệt đối.</p>
        </div>
        <ul className="steps-list">
          <li className="step-item">
            <span className="step-num">01</span>
            <h3>Chọn mẫu hoặc gửi ý tưởng</h3>
            <p>Chọn từ bộ sưu tập có sẵn hoặc gửi phác thảo thiết kế riêng theo phong cách hôn lễ của bạn.</p>
          </li>
          <li className="step-item">
            <span className="step-num">02</span>
            <h3>Duyệt mô hình 3D &amp; Bản in thử</h3>
            <p>Kiểm tra chính xác tên, ngày giờ, địa điểm và hình dung tấm thiệp thật qua không gian 3D trực quan.</p>
          </li>
          <li className="step-item">
            <span className="step-num">03</span>
            <h3>Chế tác &amp; Bàn giao trọn vẹn</h3>
            <p>Xưởng tiến hành ép kim, gia công mép xé thủ công và kích hoạt trang thiệp số RSVP đồng bộ.</p>
          </li>
        </ul>
      </section>

      {/* Digital RSVP Banner */}
      <section className="home-band" id="thiep-so">
        <div className="digital-hero-band">
          <div className="digital-hero-info">
            <h2>Thiệp cưới số tương tác đa chiều</h2>
            <p>
              Tặng kèm trang thiệp số riêng biệt cho từng cặp đôi: khách mời nhận thiệp qua điện thoại, xác nhận tham dự (RSVP),
              xem bản đồ chỉ đường và gửi lời chúc mừng trực tiếp đến cô dâu chú rể.
            </p>
          </div>
          <div>
            <a href="/collections" className="digital-btn">
              Khám phá mẫu thiệp số &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#3e4a39', letterSpacing: '0.05em' }}>
          MORI WEDDING ATELIER · XƯỞNG THIỆP CƯỚI GIẤY NGÀ SINH THÁI
        </p>
        <p style={{ margin: 0, fontSize: '12px' }}>
          Tất cả sản phẩm sử dụng 100% giấy bã mía không tẩy trắng, mực in gốc khoáng thân thiện môi trường.
        </p>
      </footer>
    </div>
  )
}
