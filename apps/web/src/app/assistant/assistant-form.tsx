'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  AssistantChatApiResponse,
  ChatMessageItem,
  ConversationWeddingBrief,
} from './assistant-types'
import { AssistantChatBubble } from './assistant-chat-bubble'
import { AssistantContextBar } from './assistant-context-bar'

const STORAGE_KEY = 'mori_atelier_assistant_session_v2'

const DEFAULT_BRIEF: ConversationWeddingBrief = {
  coupleNames: null,
  weddingDate: null,
  season: null,
  venueCategory: null,
  location: null,
  aestheticIdentity: null,
  targetShape: null,
  guestCount: null,
  estimatedSuites: null,
  budgetRangeVnd: null,
  preferredFinishes: [],
  shortlistedSlugs: [],
  lastDiscussedSlug: null,
}

const INITIAL_GREETING: ChatMessageItem = {
  id: 'greeting-0',
  role: 'assistant',
  content:
    'Kính chào bạn, mình là Master Pierre-Minh & Vũ Cầm từ xưởng chế tác MORI Haute Papeterie Atelier. Hãy chia sẻ về ngày trọng đại của bạn — phong cách yêu thích, không gian tiệc cưới (sân vườn, bãi biển, tư gia hay khách sạn), hoặc số lượng khách mời để chúng mình đồng hành kiến tạo bộ thiệp độc bản nhé.',
}

const QUICK_STARTERS = [
  'Tiệc sân vườn ngoài trời Đà Lạt 120 khách',
  'Lễ cưới truyền thống Song Hỷ Á Đông',
  'Phong cách Editorial Vogue Paris sang trọng',
  'Tư vấn chi phí theo số lượng khách',
]

export function AssistantForm() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING])
  const [brief, setBrief] = useState<ConversationWeddingBrief>(DEFAULT_BRIEF)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickOptions, setQuickOptions] = useState<string[]>(QUICK_STARTERS)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { messages: ChatMessageItem[]; brief: ConversationWeddingBrief }
        if (parsed.messages?.length) setMessages(parsed.messages)
        if (parsed.brief) setBrief(parsed.brief)
      }
    } catch {
      // Local storage unreadable
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, brief }))
    } catch {
      // Local storage quota exceeded
    }
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, brief])

  async function sendMessage(textToSend: string) {
    const text = textToSend.trim()
    if (!text || loading) return

    const userMsg: ChatMessageItem = { id: `u-${Date.now()}`, role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const history = updatedMessages.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/assistant/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history, context: brief }),
      })

      if (!res.ok) {
        if (res.status === 409) {
          const quotaMsg: ChatMessageItem = {
            id: `quota-${Date.now()}`,
            role: 'assistant',
            content:
              'Bạn đã sử dụng hết hạn mức 5 lượt tư vấn hôm nay dành cho khách vãng lai. Vui lòng đăng nhập tài khoản MORI để tiếp tục trò chuyện (30 lượt/ngày), hoặc quay lại vào ngày mai nhé ✦',
          }
          setMessages((prev) => [...prev, quotaMsg])
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const data = (await res.json()) as AssistantChatApiResponse
      const botMsg: ChatMessageItem = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        products: data.suggestedProducts,
        budget: data.estimatedBudget,
        meta: data.meta,
      }

      setMessages((prev) => [...prev, botMsg])
      if (data.updatedBrief) setBrief(data.updatedBrief)
      if (data.quickFollowUps?.length) setQuickOptions(data.quickFollowUps)
    } catch {
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'MORI xin lỗi, kết nối tới xưởng chế tác đang gián đoạn. Bạn vui lòng thử lại sau giây lát.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([INITIAL_GREETING])
    setBrief(DEFAULT_BRIEF)
    setQuickOptions(QUICK_STARTERS)
  }

  return (
    <div className="assistant-container">
      <AssistantContextBar brief={brief} onReset={handleReset} />

      <div className="chat-window-pane">
        <div className="chat-messages-flow">
          {messages.map((m) => (
            <AssistantChatBubble key={m.id} message={m} />
          ))}
          {loading && (
            <div className="chat-row assistant-row">
              <div className="assistant-avatar">⚜️</div>
              <div className="assistant-bubble-container">
                <div className="typing-indicator-bar">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-label">Master Pierre-Minh đang chọn mẫu và phối chất liệu...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        <div className="chat-input-dock">
          <div className="quick-chips-row">
            {quickOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className="quick-chip-button"
                disabled={loading}
                onClick={() => void sendMessage(opt)}
              >
                ✦ {opt}
              </button>
            ))}
          </div>

          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault()
              void sendMessage(input)
            }}
          >
            <input
              type="text"
              className="chat-input-field"
              placeholder="Nhắn tin với Nghệ nhân MORI (vd: Tụi mình cưới ở Đà Lạt, 120 khách...)"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
              {loading ? 'Đang gửi...' : 'Gửi ✦'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
