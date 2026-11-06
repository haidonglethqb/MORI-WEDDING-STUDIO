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
          <span className="assistant-badge">MORI HAUTE PAPETERIE · MULTI-AGENT AI</span>
          <h1>Trợ lý Nghệ nhân May đo Thiệp Cưới</h1>
          <p>
            Trò chuyện trực tiếp cùng Master Pierre-Minh &amp; Vũ Cầm. Chia sẻ câu chuyện tình yêu, không gian tiệc cưới và ngân sách để cùng kiến tạo bộ thiệp độc bản trên giấy bã mía 350gsm.
          </p>
        </header>

        <AssistantForm />
      </main>
    </>
  )
}
