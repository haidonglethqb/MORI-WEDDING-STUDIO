import { HomeNav } from '../home-nav'
import { LoginForm } from './login-form'
import { MoriIcon } from '../../components/mori-icon'
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
              <span className="editorial-kicker"><MoriIcon name="spark" /> MORI ATELIER</span>
              <h2>Nghệ thuật thiệp cưới giấy ngà thủ công</h2>
              <p>
                Theo dõi yêu cầu thiết kế, bản duyệt và thiệp mời trực tuyến trong cùng một không gian.
              </p>
            </div>

            <div className="editorial-features">
              <div className="feature-pill">
                <MoriIcon name="paper" />
                <div>
                  <strong>Thiết kế thiệp giấy</strong>
                  <small>Trao đổi quy cách và chất liệu cùng xưởng</small>
                </div>
              </div>
              <div className="feature-pill">
                <MoriIcon name="heart" />
                <div>
                  <strong>Haute Papeterie Atelier</strong>
                  <small>Yêu cầu và phản hồi được lưu theo từng thiết kế</small>
                </div>
              </div>
              <div className="feature-pill">
                <MoriIcon name="envelope" />
                <div>
                  <strong>Thiệp cưới số tương tác đa chiều</strong>
                  <small>Quản lý nội dung thiệp và phản hồi khách mời</small>
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
