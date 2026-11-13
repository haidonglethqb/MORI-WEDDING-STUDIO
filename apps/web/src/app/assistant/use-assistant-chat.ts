'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  AssistantChatApiResponse,
  ChatMessageItem,
  ConversationWeddingBrief,
} from './assistant-types'

const STORAGE_KEY = 'mori_atelier_assistant_session_v2'
const SESSION_KEY = 'mori_atelier_chat_session_id'

function createSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_BRIEF: ConversationWeddingBrief = {
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

export const INITIAL_GREETING: ChatMessageItem = {
  id: 'greeting-0',
  role: 'assistant',
  content:
    'Chào bạn, mình là trợ lý MORI. Hãy chia sẻ phong cách yêu thích hoặc số lượng khách mời, mình sẽ giúp bạn tìm hướng thiết kế phù hợp nhé.',
}

export const QUICK_STARTERS = [
  'Tiệc sân vườn ngoài trời Đà Lạt 120 khách',
  'Lễ cưới truyền thống Song Hỷ Á Đông',
  'Phong cách Editorial Vogue Paris sang trọng',
  'Tư vấn chi phí theo ngân sách 2 - 3 triệu',
]

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING])
  const [brief, setBrief] = useState<ConversationWeddingBrief>(DEFAULT_BRIEF)
  const [sessionId, setSessionId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickOptions, setQuickOptions] = useState<string[]>(QUICK_STARTERS)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      let savedSession = localStorage.getItem(SESSION_KEY)
      if (!savedSession) {
        savedSession = createSessionId()
        localStorage.setItem(SESSION_KEY, savedSession)
      }
      setSessionId(savedSession)

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as {
          messages: ChatMessageItem[]
          brief: ConversationWeddingBrief
        }
        if (parsed.messages?.length) setMessages(parsed.messages)
        if (parsed.brief) setBrief(parsed.brief)
      }
    } catch {
      // Storage unavailable
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, brief }))
    } catch {
      // Storage full
    }
    // Scroll only the conversation pane; scrollIntoView also moved the window on load.
    const pane = scrollAnchorRef.current?.parentElement
    if (pane) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      pane.scrollTo({ top: pane.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
    }
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
      const activeSession = sessionId || createSessionId()
      const res = await fetch('/assistant/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history, context: brief, sessionId: activeSession }),
      })

      if (!res.ok) {
        if (res.status === 409) {
          const quotaMsg: ChatMessageItem = {
            id: `quota-${Date.now()}`,
            role: 'assistant',
            content:
              'Bạn đã sử dụng hết hạn mức tư vấn hôm nay dành cho khách vãng lai. Vui lòng đăng nhập tài khoản MORI để tiếp tục trò chuyện (30 lượt/ngày), hoặc quay lại vào ngày mai nhé.',
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
      }

      setMessages((prev) => [...prev, botMsg])
      if (data.updatedBrief) setBrief(data.updatedBrief)
      if (data.quickFollowUps?.length) setQuickOptions(data.quickFollowUps)
    } catch {
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'MORI xin lỗi, kết nối tới xưởng chế tác đang gián đoạn. Bạn vui lòng thử lại sau giây lát.',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    const nextSession = createSessionId()
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(SESSION_KEY, nextSession)
    } catch {
      // Storage unavailable
    }
    setSessionId(nextSession)
    setMessages([INITIAL_GREETING])
    setBrief(DEFAULT_BRIEF)
    setQuickOptions(QUICK_STARTERS)
  }

  return {
    messages,
    brief,
    input,
    setInput,
    loading,
    quickOptions,
    scrollAnchorRef,
    sendMessage,
    handleReset,
  }
}
