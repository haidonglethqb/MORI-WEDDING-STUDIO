import { HomeNav } from '../home-nav'
import { LoginForm } from './login-form'
import './login.css'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <>
      <HomeNav />
      <main className="auth-layout">
        <div className="auth-container">
          <section className="auth-editorial-panel" aria-label="Giới thiệu Atelier">
            <div>
              <span className="editorial-kicker">✦ MORI ATELIER · 2026 ✦</span>
              <h2>Nghệ thuật thiệp cưới giấy ngà thủ công</h2>
              <p>
                Không gian thiết kế và quản lý tiến trình may đo thiệp cưới độc bản,
                kết hợp chất liệu giấy bã mía 350gsm và thiệp số tương tác đa chiều.
              </p>
            </div>

            <div className="editorial-features">
              <div className="feature-pill">
                <span>🌿</span>
                <div>
                  <strong>100% Tree-free Sugar Cane Paper</strong>
                  <small>Giấy bã mía hữu cơ 350gsm dập nổi nhiệt 160°C</small>
                </div>
              </div>
              <div className="feature-pill">
                <span>⚜️</span>
                <div>
                  <strong>Haute Papeterie Atelier</strong>
                  <small>Từng bộ thiệp sắp riêng theo câu chuyện tình yêu</small>
                </div>
              </div>
              <div className="feature-pill">
                <span>💌</span>
                <div>
                  <strong>Thiệp cưới số tương tác đa chiều</strong>
                  <small>Đồng bộ RSVP tức thì, bảo mật quyền riêng tư</small>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-form-panel">
            <LoginForm />
          </section>
        </div>
      </main>
    </>
  )
}
