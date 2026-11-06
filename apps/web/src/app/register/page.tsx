import { RegisterForm } from './register-form'
import { HomeNav } from '../home-nav'
import '../login/login.css'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <>
      <HomeNav />
      <main className="auth-layout">
        <div className="auth-container">
          <section className="auth-editorial-panel" aria-label="Đặc quyền hội viên MORI">
            <div>
              <span className="editorial-kicker">✦ ĐẶC QUYỀN HỘI VIÊN ✦</span>
              <h2>Khởi đầu hành trình lưu giữ khoảnh khắc</h2>
              <p>
                Đăng ký tài khoản để may đo thiết kế thiệp cưới, lưu danh sách khách mời
                và trải nghiệm công nghệ xem trước 3D chuẩn xác từng đường nét ép kim.
              </p>
            </div>

            <div className="editorial-features">
              <div className="feature-pill">
                <span>🎨</span>
                <div>
                  <strong>Trợ lý AI Stylist cá nhân hoá</strong>
                  <small>Gợi ý bảng màu & phong cách thiệp cưới theo sở thích</small>
                </div>
              </div>
              <div className="feature-pill">
                <span>📋</span>
                <div>
                  <strong>Quản lý khách mời & thiệp số</strong>
                  <small>Gửi thiệp online và thống kê phản hồi RSVP tự động</small>
                </div>
              </div>
              <div className="feature-pill">
                <span>📦</span>
                <div>
                  <strong>Theo dõi tiến độ xưởng chế tác</strong>
                  <small>Cập nhật trạng thái in, dập nhiệt và giao nhận thiệp</small>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-form-panel">
            <RegisterForm />
          </section>
        </div>
      </main>
    </>
  )
}
