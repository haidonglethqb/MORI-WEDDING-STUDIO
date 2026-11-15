'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_BRIEF,
  INITIAL_GREETING,
  QUICK_STARTERS,
  createAssistantSessionId,
  loadOrCreateChatStorage,
  persistChatStorage,
  postAssistantTurn,
  postHumanEscalation,
  resetChatStorage,
} from './assistant-chat-api'
import {
  extractEscalatedFlag,
  extractStaffReplies,
  mergeSyncedStaffMessages,
} from './assistant-session-sync'
import type { ChatMessageItem, ConversationWeddingBrief } from './assistant-types'

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING])
  const [brief, setBrief] = useState<ConversationWeddingBrief>(DEFAULT_BRIEF)
  const [sessionId, setSessionId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [escalateError, setEscalateError] = useState<string | null>(null)
  const [quickOptions, setQuickOptions] = useState<string[]>(QUICK_STARTERS)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loaded = loadOrCreateChatStorage()
    setSessionId(loaded.sessionId)
    if (loaded.messages?.length) setMessages(loaded.messages)
    if (loaded.brief) setBrief(loaded.brief)
    if (loaded.escalated) setEscalated(true)
  }, [])

  useEffect(() => {
    persistChatStorage(messages, brief, escalated)
    const pane = scrollAnchorRef.current?.parentElement
    if (pane) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      pane.scrollTo({ top: pane.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [messages, brief, escalated])

  useEffect(() => {
    if (!sessionId) return
    let active = true

    async function syncSessionReplies() {
      if (!active || document.visibilityState === 'hidden') return
      try {
        const res = await fetch(`/assistant/session?sessionId=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        })
        if (!res.ok || !active) return
        const payload = (await res.json()) as unknown
        if (extractEscalatedFlag(payload)) setEscalated(true)
        const staffReplies = extractStaffReplies(payload)
        if (staffReplies.length > 0) {
          setMessages((prev) => mergeSyncedStaffMessages(prev, staffReplies))
        }
      } catch {
        // Ignore polling errors
      }
    }

    void syncSessionReplies()
    const timer = window.setInterval(() => void syncSessionReplies(), 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [sessionId])

  async function sendMessage(textToSend: string) {
    const text = textToSend.trim()
    if (!text || loading) return

    const updated = [...messages, { id: `u-${Date.now()}`, role: 'user' as const, content: text }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const result = await postAssistantTurn(
      text,
      updated,
      brief,
      sessionId || createAssistantSessionId(),
    )
    setLoading(false)

    if (result.kind === 'quota') {
      setMessages((prev) => [
        ...prev,
        {
          id: `quota-${Date.now()}`,
          role: 'assistant',
          content:
            'Bạn đã dùng hết hạn mức tư vấn hôm nay dành cho khách vãng lai. Hãy đăng nhập hoặc bấm “Gặp nhân viên tư vấn (Admin)” để được hỗ trợ trực tiếp nhé.',
        },
      ])
      return
    }
    if (result.kind === 'error') {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'MORI xin lỗi, kết nối tới trợ lý đang gián đoạn. Bạn có thể bấm “Gặp nhân viên tư vấn (Admin)” hoặc gửi yêu cầu thiết kế riêng trên trang Bộ sưu tập.',
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        senderType: 'ai',
        content: result.data.reply,
        products: result.data.suggestedProducts,
        budget: result.data.estimatedBudget,
      },
    ])
    if (result.data.needsHumanSupport) setEscalated(true)
    if (result.data.updatedBrief) setBrief(result.data.updatedBrief)
    if (result.data.quickFollowUps?.length) setQuickOptions(result.data.quickFollowUps)
  }

  async function escalateToHuman(contact: string, note: string): Promise<boolean> {
    setEscalating(true)
    setEscalateError(null)
    const ok = await postHumanEscalation(
      sessionId || createAssistantSessionId(),
      contact,
      note,
      messages,
    )
    setEscalating(false)

    if (!ok) {
      setEscalateError(
        'Chưa thể chuyển phiên tự động lúc này. Bạn vui lòng gửi yêu cầu thiết kế riêng trên trang Bộ sưu tập hoặc thử lại sau nhé.',
      )
      return false
    }

    setEscalated(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `esc-${Date.now()}`,
        role: 'assistant',
        senderType: 'system',
        senderLabel: 'Hệ thống hỗ trợ MORI',
        content: `Đã chuyển cuộc trò chuyện kèm thông tin liên hệ (${contact}) tới nhân viên tư vấn MORI.${note ? ` Ghi chú: "${note}".` : ''} Phản hồi từ nhân viên sẽ hiện trực tiếp tại khung chat này.`,
      },
    ])
    return true
  }

  function handleReset() {
    setSessionId(resetChatStorage())
    setMessages([INITIAL_GREETING])
    setBrief(DEFAULT_BRIEF)
    setEscalated(false)
    setEscalateError(null)
    setQuickOptions(QUICK_STARTERS)
  }

  return {
    messages,
    brief,
    input,
    setInput,
    loading,
    escalated,
    escalating,
    escalateError,
    quickOptions,
    scrollAnchorRef,
    sendMessage,
    escalateToHuman,
    handleReset,
  }
}
