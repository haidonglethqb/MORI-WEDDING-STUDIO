import { HomeNav } from '../home-nav'
import { AssistantForm } from './assistant-form'
import './assistant.css'
import './radiant-prompt.css'

export const dynamic = 'force-dynamic'

export default function AssistantPage() {
  return (
    <>
      <HomeNav />
      <main className="assistant-page">
        <header className="assistant-header">
          <span className="assistant-badge">MORI ATELIER · CỐ VẤN NGHỆ THUẬT</span>
          <h1>Trợ Lý Nghệ Thuật May Đo Thiệp Cưới</h1>
          <p>
            Tìm phong cách phù hợp, xem thông tin mẫu và gửi yêu cầu để xưởng tư vấn theo nhu cầu của bạn.
          </p>
        </header>

        <AssistantForm />
      </main>
    </>
  )
}
