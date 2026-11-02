import '../login/login.css'
import { AssistantForm } from './assistant-form'

export const dynamic = 'force-dynamic'

export default function AssistantPage() {
  return (
    <main className="login">
      <h1>Gợi ý mẫu</h1>
      <p>Câu trả lời lấy từ các mẫu đang bán. Mô hình ngôn ngữ đang tắt.</p>
      <AssistantForm />
    </main>
  )
}
