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
          <strong>Khám phá</strong>
          <a href="/collections">Bộ sưu tập</a>
          <a href="/assistant">Trợ lý AI Stylist</a>
          <a href="/#thiep-so">Thiệp cưới số</a>
          <a href="/#quy-trinh">Quy trình cùng MORI</a>
        </div>
        <div className="footer-links-col">
          <strong>Không gian làm việc</strong>
          <a href="/login">Đăng nhập tài khoản</a>
          <a href="/workspace">Việc của tôi</a>
          <a href="/#faq">Câu hỏi thường gặp</a>
          <a href="/addresses">Sổ địa chỉ</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 MORI Wedding Studio Atelier · All rights reserved.</p>
        <p className="footer-eco-badge">Thiết kế theo câu chuyện của bạn</p>
      </div>
    </footer>
  )
}
