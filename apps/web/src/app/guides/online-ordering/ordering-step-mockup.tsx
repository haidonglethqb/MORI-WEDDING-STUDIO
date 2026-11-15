import Image from 'next/image'
import type { OnlineStepMockupKind } from './online-ordering-data'

function MockBrowserBar({ url }: { url: string }) {
  return (
    <div className="mockup-chrome-bar" aria-hidden="true">
      <div className="mockup-dots">
        <span />
        <span />
        <span />
      </div>
      <div className="mockup-url">{url}</div>
    </div>
  )
}

export function OrderingStepMockup({ kind }: { kind: OnlineStepMockupKind }) {
  if (kind === 'nav-collections') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz" />
        <div className="mockup-body">
          <div className="mockup-navbar">
            <span className="mockup-logo">MORI</span>
            <div className="mockup-nav-items">
              <span>Trang chủ</span>
              <span className="mockup-target-pill">Bộ sưu tập</span>
              <span>Blog cưới</span>
              <span>Trợ lý AI</span>
            </div>
          </div>
          <div className="mockup-mini-banner">
            <strong>Thiệp cưới giấy bã mía &amp; Thiệp online</strong>
            <span>Nhấn “Bộ sưu tập” để khám phá 50+ mẫu thiết kế</span>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'browse-grid') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/collections" />
        <div className="mockup-body">
          <div className="mockup-filter-row">
            <span className="mockup-chip is-on">Tất cả</span>
            <span className="mockup-chip">Thiệp giấy</span>
            <span className="mockup-chip">Thiệp online</span>
            <span className="mockup-chip">Combo -50%</span>
          </div>
          <div className="mockup-product-grid">
            <div className="mockup-product-tile is-focused">
              <div className="mockup-thumb">
                <Image src="/images/products/floral/floral-bifold-01.jpg" alt="" fill unoptimized sizes="160px" />
              </div>
              <strong>Hương Bách Thảo</strong>
              <span className="mockup-target-badge">Xem mẫu →</span>
            </div>
            <div className="mockup-product-tile">
              <div className="mockup-thumb">
                <Image src="/images/products/editorial/editorial-flat-01.jpg" alt="" fill unoptimized sizes="160px" />
              </div>
              <strong>Vogue Ngà Ivory</strong>
              <span>11.000 ₫ / bộ</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'select-variant') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/products/floral-bifold-01" />
        <div className="mockup-body mockup-detail-split">
          <div className="mockup-thumb-tall">
            <Image src="/images/products/floral/floral-bifold-01.jpg" alt="" fill unoptimized sizes="180px" />
            <span className="mockup-2d-tag">Ảnh thật 2D</span>
          </div>
          <div className="mockup-spec-col">
            <strong>Hương Bách Thảo</strong>
            <div className="mockup-option-row">
              <span className="mockup-chip is-on">Thiệp gấp (Bi-fold)</span>
              <span className="mockup-chip">Thiệp phẳng</span>
            </div>
            <div className="mockup-select-box">Số lượng: 100 bộ thiệp</div>
            <div className="mockup-combo-box">
              <span>+ Kèm Thiệp Online</span>
              <strong className="mockup-discount-pill">Giảm 50%</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'add-to-cart') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/products/floral-bifold-01" />
        <div className="mockup-body">
          <div className="mockup-cart-action-row">
            <span className="mockup-qty-box">100 bộ thiệp</span>
            <span className="mockup-target-btn">Thêm vào giỏ hàng</span>
            <span className="mockup-cart-icon">Giỏ hàng (1)</span>
          </div>
          <div className="mockup-toast-success">✓ Đã thêm sản phẩm vào giỏ hàng</div>
        </div>
      </div>
    )
  }

  if (kind === 'review-cart') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/cart" />
        <div className="mockup-body">
          <div className="mockup-cart-line">
            <span>Hương Bách Thảo · Gấp đôi (×100)</span>
            <strong>1.100.000 ₫</strong>
          </div>
          <div className="mockup-cart-line">
            <span>Thiệp Online · Ưu đãi Combo (-50%)</span>
            <strong>249.500 ₫</strong>
          </div>
          <div className="mockup-cart-total">
            <span>Tổng tạm tính</span>
            <strong>1.349.500 ₫</strong>
          </div>
          <div className="mockup-align-end">
            <span className="mockup-target-btn">Thanh toán</span>
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'customer-info') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/checkout" />
        <div className="mockup-body mockup-form-grid">
          <div className="mockup-field">Họ tên: Nguyễn Minh Anh</div>
          <div className="mockup-field">SĐT / Email: 0901234567</div>
          <div className="mockup-field is-wide">Địa chỉ nhận thiệp: Q.1, TP. Hồ Chí Minh</div>
          <div className="mockup-field is-wide is-highlight">
            Ghi chú thiệp: Tên cô dâu chú rể, ngày cưới, mã font MORI F01
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'checkout-confirm') {
    return (
      <div className="ordering-mockup-frame">
        <MockBrowserBar url="moriwedding.xyz/checkout" />
        <div className="mockup-body">
          <div className="mockup-pay-methods">
            <span className="mockup-chip is-on">MoMo</span>
            <span className="mockup-chip">VNPAY</span>
            <span className="mockup-chip">QR Ngân hàng</span>
            <span className="mockup-chip">COD</span>
          </div>
          <div className="mockup-align-end">
            <span className="mockup-target-btn">Xác nhận đặt hàng</span>
          </div>
          <div className="mockup-toast-success">
            ✓ Tiếp nhận đơn thành công · Mã đơn: <strong>MORI-0001</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ordering-mockup-frame">
      <MockBrowserBar url="moriwedding.xyz/order-tracking" />
      <div className="mockup-body">
        <div className="mockup-track-pills">
          <span className="is-done">Đã tiếp nhận</span>
          <span className="is-done">Đang thiết kế</span>
          <span className="is-current">Chờ khách duyệt mẫu 2D</span>
          <span>Đang in ấn</span>
          <span>Hoàn thành</span>
        </div>
        <div className="mockup-mini-banner">
          <strong>Nhân viên MORI gửi bản thiết kế 2D qua Website / Email</strong>
          <span>Chỉ chuyển sang in ấn sau khi bạn xác nhận bản cuối</span>
        </div>
      </div>
    </div>
  )
}
