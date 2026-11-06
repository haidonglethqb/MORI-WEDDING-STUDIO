import { HomeNav } from '../home-nav'
import { AssistantForm } from './assistant-form'
import './assistant.css'

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
            Đồng hành cùng Nghệ nhân Trưởng Pierre-Minh &amp; Vũ Cầm để lắng nghe tư vấn độc bản về chất liệu giấy bã mía hữu cơ 350gsm, kỹ nghệ ép kim nhiệt 160°C và mép xé thủ công cho ngày trọng đại.
          </p>
        </header>

        <AssistantForm />
      </main>
    </>
  )
}
