'use client'

import { useEffect, useRef, useState } from 'react'
import { compressImageFileToDataUrl } from '../../features/digital-templates/photo-upload-helper'
import {
  DEFAULT_BRIEF,
  INITIAL_GREETING,
  QUICK_STARTERS,
  createAssistantSessionId,
  loadOrCreateChatStorage,
  persistChatStorage,
  postHumanEscalation,
  resetChatStorage,
} from './assistant-chat-api'
import { extractEscalatedFlag, extractStaffReplies, mergeSyncedStaffMessages } from './assistant-session-sync'
import { streamAssistantTurn } from './assistant-stream-client'
import type { AgentAttachment, AgentToolTraceItem, ChatMessageItem, ConversationWeddingBrief } from './assistant-types'

export function useAssistantChat(isLoggedIn = false) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING])
  const [brief, setBrief] = useState<ConversationWeddingBrief>(DEFAULT_BRIEF)
  const [sessionId, setSessionId] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState('')
  const [activeTraces, setActiveTraces] = useState<AgentToolTraceItem[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [attachment, setAttachment] = useState<AgentAttachment | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
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
    const pane = scrollAnchorRef.current?.closest('.chat-messages-flow')
    if (pane) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      pane.scrollTo({ top: pane.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [messages, brief, escalated, activeTraces, streamingText])

  useEffect(() => {
    if (!sessionId) return
    let active = true
    async function syncSessionReplies() {
      if (!active || document.visibilityState === 'hidden') return
      try {
        const res = await fetch(`/assistant/session?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
        if (!res.ok || !active) return
        const payload = (await res.json()) as unknown
        if (extractEscalatedFlag(payload)) setEscalated(true)
        const staffReplies = extractStaffReplies(payload)
        if (staffReplies.length > 0) setMessages((prev) => mergeSyncedStaffMessages(prev, staffReplies))
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

  async function attachMoodboardImage(file: File | undefined, customLabel?: string) {
    if (!file) return
    try {
      const dataUrl = await compressImageFileToDataUrl(file)
      setAttachment({ kind: 'image', dataUrl, label: customLabel || file.name || 'Ảnh đính kèm' })
    } catch {
      setAttachment(null)
    }
  }

  async function sendMessage(textToSend: string) {
    const currentAttach = attachment
    const text = textToSend.trim() || (currentAttach ? 'Ghép ảnh này vào mẫu thiệp online giúp mình' : '')
    if (!text || loading) return
    const updated: ChatMessageItem[] = [
      ...messages,
      { id: `u-${Date.now()}`, role: 'user', content: text, ...(currentAttach ? { attachmentDataUrl: currentAttach.dataUrl } : {}) },
    ]
    setMessages(updated)
    setInput('')
    setAttachment(null)
    setLoading(true)
    setActiveStatus('MORI Agent đang kết nối...')
    setActiveTraces([])
    setStreamingText('')

    const result = await streamAssistantTurn(
      text,
      updated,
      brief,
      sessionId || createAssistantSessionId(),
      currentAttach ? [currentAttach] : [],
      {
        onStatus: setActiveStatus,
        onToolStart: (t) => setActiveTraces((prev) => [...prev, t]),
        onToolDone: (t) => setActiveTraces((prev) => prev.map((x) => (x.id === t.id ? t : x))),
        onDelta: (chunk) => setStreamingText((prev) => prev + chunk),
      },
    )

    setLoading(false)
    setActiveStatus('')
    setActiveTraces([])
    setStreamingText('')

    if (result.kind === 'quota') {
      setQuotaExceeded(true)
      const notice: ChatMessageItem = isLoggedIn
        ? {
            id: `quota-${Date.now()}`, role: 'assistant', senderType: 'system', senderLabel: 'Giới hạn lượt trò chuyện hôm nay',
            content: 'Bạn đã đạt hạn mức lượt trò chuyện AI hôm nay do quản trị viên thiết lập. Bạn có thể bấm “Gặp nhân viên tư vấn” để được hỗ trợ ngay hoặc quay lại vào ngày mai nhé!',
          }
        : {
            id: `quota-${Date.now()}`, role: 'assistant', senderType: 'system', senderLabel: 'Giới hạn khách vãng lai',
            content: 'Bạn đã dùng hết 5 câu hỏi miễn phí dành cho khách chưa đăng nhập. Hãy đăng nhập tài khoản MORI để tiếp tục trò chuyện không giới hạn nhé!',
          }
      setMessages((prev) => [...prev, notice])
      return
    }
    if (result.kind === 'error') {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'MORI xin lỗi, kết nối tới trợ lý đang gián đoạn. Bạn có thể bấm “Gặp nhân viên tư vấn” hoặc thử lại sau nhé.' }])
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
        ...(result.data.toolTraces ? { toolTraces: result.data.toolTraces } : {}),
        ...(result.data.proposedActions ? { proposedActions: result.data.proposedActions } : {}),
      },
    ])
    if (result.data.needsHumanSupport) setEscalated(true)
    if (result.data.updatedBrief) setBrief(result.data.updatedBrief)
    if (result.data.quickFollowUps?.length) setQuickOptions(result.data.quickFollowUps)
  }

  async function escalateToHuman(contact: string, note: string): Promise<boolean> {
    setEscalating(true)
    setEscalateError(null)
    const ok = await postHumanEscalation(sessionId || createAssistantSessionId(), contact, note, messages)
    setEscalating(false)
    if (!ok) {
      setEscalateError('Chưa thể chuyển phiên tự động lúc này. Bạn vui lòng gửi yêu cầu thiết kế riêng trên trang Bộ sưu tập hoặc thử lại sau nhé.')
      return false
    }
    setEscalated(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `esc-${Date.now()}`, role: 'assistant', senderType: 'system', senderLabel: 'Hệ thống hỗ trợ MORI',
        content: `Đã chuyển cuộc trò chuyện kèm thông tin liên hệ (${contact}) tới nhân viên tư vấn MORI.${note ? ` Ghi chú: "${note}".` : ''} Phản hồi từ nhân viên sẽ hiện trực tiếp tại khung chat này.`,
      },
    ])
    return true
  }

  function handleReset() {
    setSessionId(resetChatStorage())
    setMessages([INITIAL_GREETING])
    setBrief(DEFAULT_BRIEF)
    setAttachment(null)
    setEscalated(false)
    setEscalateError(null)
    setQuickOptions(QUICK_STARTERS)
  }

  const latestUserPhoto = [...messages].reverse().find((m) => m.role === 'user' && m.attachmentDataUrl)?.attachmentDataUrl

  return {
    messages, brief, input, setInput, loading, activeStatus, activeTraces,
    streamingText, attachment, setAttachment, attachMoodboardImage, latestUserPhoto, quotaExceeded,
    escalated, escalating, escalateError, quickOptions, scrollAnchorRef,
    sendMessage, escalateToHuman, handleReset,
  }
}
