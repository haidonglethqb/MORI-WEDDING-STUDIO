import Link from 'next/link'

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <span className="footer-mark">MORI</span>
          <span className="footer-tagline">THIỆP CƯỚI &amp; THIỆP TRỰC TUYẾN</span>
          <p className="footer-desc">
            Cùng bạn chọn thiết kế, hoàn thiện nội dung và theo dõi từng bước làm thiệp.
          </p>
        </div>

        <div className="footer-links-col">
          <strong>KHÁM PHÁ</strong>
          <Link href="/collections">Bộ sưu tập</Link>
          <Link href="/collections?tab=online">Thiệp cưới online</Link>
          <Link href="/collections?tab=combo">Combo ưu đãi 50%</Link>
          <Link href="/blog">Blog cưới</Link>
          <Link href="/assistant">Trợ lý AI</Link>
        </div>

        <div className="footer-links-col">
          <strong>HƯỚNG DẪN VÀ HỖ TRỢ</strong>
          <Link href="/guides/order-process">Quy Trình Đặt Và Nhận Thiệp</Link>
          <Link href="/guides/online-ordering">Hướng Dẫn Đặt Hàng Online</Link>
          <Link href="/order-tracking">Kiểm Tra Đơn Hàng</Link>
          <Link href="/faq">Các Câu Hỏi Thường Gặp</Link>
          <Link href="/fonts">Bảng Font Chữ Thiệp Cưới</Link>
        </div>

        <div className="footer-links-col">
          <strong>TÀI KHOẢN</strong>
          <Link href="/login">Đăng nhập tài khoản</Link>
          <Link href="/cart">Giỏ hàng</Link>
          <Link href="/checkout">Thanh toán</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MORI Wedding Studio Atelier · All rights reserved.</p>
        <p className="footer-eco-badge">Thiết kế theo câu chuyện của bạn</p>
      </div>
    </footer>
  )
}
