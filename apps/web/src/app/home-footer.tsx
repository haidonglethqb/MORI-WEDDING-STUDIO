export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <span className="footer-mark">MORI</span>
          <span className="footer-tagline">ATELIER THIỆP CƯỚI GIẤY NGÀ SINH THÁI</span>
          <p className="footer-desc">
            Tất cả sản phẩm sử dụng 100% giấy bã mía không tẩy trắng, mực in gốc khoáng thân thiện môi trường
            và quy trình chế tác thủ công chuẩn mực.
          </p>
        </div>
        <div className="footer-links-col">
          <strong>Khám phá</strong>
          <a href="/collections">Bộ sưu tập 2026</a>
          <a href="/assistant">Trợ lý AI Stylist</a>
          <a href="/#thiep-so">Thiệp cưới số</a>
          <a href="/#du-toan">Bảng dự toán chi phí</a>
        </div>
        <div className="footer-links-col">
          <strong>Không gian làm việc</strong>
          <a href="/login">Đăng nhập tài khoản</a>
          <a href="/workspace">Việc của tôi</a>
          <a href="/studio">Hàng đợi xưởng (Studio)</a>
          <a href="/addresses">Sổ địa chỉ</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 MORI Wedding Studio Atelier · All rights reserved.</p>
        <p className="footer-eco-badge">🌿 100% Tree-Free &amp; Zero Plastic Packaging</p>
      </div>
    </footer>
  )
}
