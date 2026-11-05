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
          <span className="assistant-badge">ATELIER STYLIST AI</span>
          <h1>Trợ lý gợi ý mẫu thiệp cưới</h1>
          <p>
            Chọn số lượng khách mời và phong cách hôn lễ để nghệ nhân xưởng MORI gợi ý các mẫu thiệp độc bản phù hợp nhất.
          </p>
        </header>

        <AssistantForm />
      </main>
    </>
  )
}
