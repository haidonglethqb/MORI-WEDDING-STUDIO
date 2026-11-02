import type { CatalogueProduct } from '@mori/contracts'
import { HomeNav } from './home-nav'
import './home.css'

export const dynamic = 'force-dynamic'

function apiOrigin(): string {
  return process.env['API_INTERNAL_ORIGIN'] ?? 'http://127.0.0.1:4000'
}

async function loadSelection(): Promise<CatalogueProduct[]> {
  try {
    const response = await fetch(`${apiOrigin()}/api/v1/catalog/products`, { cache: 'no-store' })
    if (!response.ok) return []
    const products = (await response.json()) as CatalogueProduct[]
    return products
      .filter((product) => product.variants.some((variant) => variant.availability !== 'UNAVAILABLE'))
      .slice(0, 4)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const selection = await loadSelection()

  return (
    <div className="home">
      <HomeNav />
      <section className="home-hero">
        <div>
          <h1>Thiệp cưới in trên giấy ngà, sắp riêng từng cặp.</h1>
          <p>Tên, ngày và địa điểm đi cùng mẫu giấy. Giá trên trang là mẫu thử khi sản phẩm được đánh dấu như vậy.</p>
          <div className="home-actions">
            <a className="home-cta" href="/collections">
              Xem bộ sưu tập
            </a>
            <a className="home-quiet" href="#thiep-so">
              Xem phần thiệp số
            </a>
          </div>
        </div>
        <div className="home-panel" role="img" aria-label="Chỗ dành cho ảnh giấy thật khi có tệp được cấp phép" />
      </section>
      <section className="home-band" aria-labelledby="selection-title">
        <h2 id="selection-title">Bốn mẫu đang mở</h2>
        {selection.length === 0 ? <p>Chưa có mẫu nào đang bán.</p> : null}
        <ul className="home-grid">
          {selection.map((product) => (
            <li key={product.slug}>
              <a href={`/products/${product.slug}`}>
                <div className="home-swatch" />
                <h3>{product.name}</h3>
                <p>{product.isFixture ? 'Mẫu thử' : product.type === 'DIGITAL' ? 'Thiệp số' : 'Thiệp giấy'}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="home-band" id="xuong" aria-labelledby="material-title">
        <h2 id="material-title">Giấy và mực</h2>
        <div className="home-material" role="img" aria-label="Chỗ dành cho ảnh chi tiết giấy" />
        <p className="home-caption">Ảnh chụp giấy thật sẽ thay khối màu này khi có tệp được cấp phép.</p>
      </section>
      <section className="home-steps" aria-labelledby="steps-title">
        <h2 id="steps-title">Ba bước với xưởng</h2>
        <ol>
          <li>
            <h3>Chọn mẫu</h3>
            <p>Chọn thiệp giấy hoặc gửi yêu cầu riêng. Mẫu gấp ba chưa mở.</p>
          </li>
          <li>
            <h3>Duyệt bản in</h3>
            <p>Xác nhận tên, ngày, địa điểm, số lượng và quy cách trên đúng bản in.</p>
          </li>
          <li>
            <h3>Nhận thành phẩm</h3>
            <p>Xưởng in thiệp giấy hoặc bàn giao thiệp số sau khi đơn được xác nhận.</p>
          </li>
        </ol>
      </section>
      <section className="home-band" id="thiep-so" aria-labelledby="digital-title">
        <h2 id="digital-title">Thiệp số</h2>
        <p>Thiệp số dùng nội dung đã xuất bản. Khách mở đường dẫn riêng, không thấy ghi chú nội bộ của xưởng.</p>
      </section>
      <footer className="home-footer" id="tai-khoan">
        MORI Wedding Studio. Nội dung và giá trên trang này là mẫu thử. Bàn tài khoản sẽ nối khi phiên đăng nhập gắn với trang.
      </footer>
    </div>
  )
}
