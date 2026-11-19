import type {
  AssistantChatApiResponse,
  ChatMessageItem,
  ConversationWeddingBrief,
} from './assistant-types'

const STORAGE_KEY = 'mori_atelier_assistant_session_v2'
const SESSION_KEY = 'mori_atelier_chat_session_id'

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
  senderType: 'ai',
  content:
    'Chào bạn, mình là trợ lý MORI. Hãy chia sẻ phong cách yêu thích hoặc số lượng khách mời, mình sẽ giúp bạn tìm hướng thiết kế phù hợp nhé.',
}

export const QUICK_STARTERS = [
  'Tiệc sân vườn ngoài trời Đà Lạt 120 khách',
  'Lễ cưới truyền thống Song Hỷ Á Đông',
  'Gợi ý combo thiệp giấy & thiệp online giảm 50%',
  'Mình muốn gặp nhân viên tư vấn thiết kế riêng',
]

export function createAssistantSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadOrCreateChatStorage(): {
  sessionId: string
  messages?: ChatMessageItem[]
  brief?: ConversationWeddingBrief
  escalated?: boolean
} {
  try {
    let savedSession = localStorage.getItem(SESSION_KEY)
    if (!savedSession) {
      savedSession = createAssistantSessionId()
      localStorage.setItem(SESSION_KEY, savedSession)
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { sessionId: savedSession }
    const parsed = JSON.parse(raw) as {
      messages?: ChatMessageItem[]
      brief?: ConversationWeddingBrief
      escalated?: boolean
    }
    return { sessionId: savedSession, ...parsed }
  } catch {
    return { sessionId: createAssistantSessionId() }
  }
}

export function persistChatStorage(
  messages: ChatMessageItem[],
  brief: ConversationWeddingBrief,
  escalated: boolean,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, brief, escalated }))
  } catch {
    // Storage full
  }
}

export function resetChatStorage(): string {
  const nextSession = createAssistantSessionId()
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(SESSION_KEY, nextSession)
  } catch {
    // Storage unavailable
  }
  return nextSession
}

export type TurnFetchResult =
  | { kind: 'ok'; data: AssistantChatApiResponse }
  | { kind: 'quota' }
  | { kind: 'error' }

export async function postAssistantTurn(
  message: string,
  messages: ChatMessageItem[],
  brief: ConversationWeddingBrief,
  sessionId: string,
): Promise<TurnFetchResult> {
  try {
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    const res = await fetch('/assistant/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, history, context: brief, sessionId }),
    })
    if (res.status === 429 || res.status === 409) return { kind: 'quota' }
    if (!res.ok) return { kind: 'error' }
    return { kind: 'ok', data: (await res.json()) as AssistantChatApiResponse }
  } catch {
    return { kind: 'error' }
  }
}

export async function postHumanEscalation(
  sessionId: string,
  contact: string,
  note: string,
  messages: ChatMessageItem[],
): Promise<boolean> {
  try {
    const res = await fetch('/assistant/escalate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        contact,
        contactInfo: contact,
        note,
        reason: note || 'Khách hàng yêu cầu gặp nhân viên tư vấn',
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
