import { calculateCartTotals, getCartItems } from '../../features/cart/cart-store'
import { postAssistantTurn, type TurnFetchResult } from './assistant-chat-api'
import type {
  AgentAttachment,
  AgentLiveContext,
  AgentToolTraceItem,
  AssistantChatApiResponse,
  ChatMessageItem,
  ConversationWeddingBrief,
} from './assistant-types'

export function collectLiveContext(): AgentLiveContext {
  const items = getCartItems()
  const totals = calculateCartTotals(items)
  return {
    currentPath: typeof window !== 'undefined' ? window.location.pathname : '/assistant',
    cartCount: totals.totalCount,
    cartTotalVnd: totals.totalVnd,
    cartItemsSummary: items.slice(0, 6).map((i) => `${i.name} (${i.productType}, SL: ${i.quantity})`),
  }
}

export interface StreamCallbacks {
  onStatus: (message: string) => void
  onToolStart: (trace: AgentToolTraceItem) => void
  onToolDone: (trace: AgentToolTraceItem) => void
  onDelta: (chunk: string) => void
}

export async function streamAssistantTurn(
  message: string,
  messages: ChatMessageItem[],
  brief: ConversationWeddingBrief,
  sessionId: string,
  attachments: AgentAttachment[],
  callbacks: StreamCallbacks,
): Promise<TurnFetchResult> {
  const history = messages.map((m) => ({ role: m.role, content: m.content }))
  const liveContext = collectLiveContext()

  try {
    const res = await fetch('/assistant/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        context: brief,
        sessionId,
        liveContext,
        ...(attachments.length > 0 ? { attachments } : {}),
      }),
    })

    if (res.status === 409) return { kind: 'quota' }
    if (!res.ok || !res.body) {
      return await postAssistantTurn(message, messages, brief, sessionId)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finalData: AssistantChatApiResponse | null = null

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        const dataLine = block.split('\n').find((l) => l.startsWith('data: '))
        if (!dataLine) continue
        try {
          const ev = JSON.parse(dataLine.slice(6)) as {
            type?: string
            message?: string
            trace?: AgentToolTraceItem
            text?: string
            response?: AssistantChatApiResponse
          }
          if (ev.type === 'status' && ev.message) callbacks.onStatus(ev.message)
          else if (ev.type === 'tool_start' && ev.trace) callbacks.onToolStart(ev.trace)
          else if (ev.type === 'tool_done' && ev.trace) callbacks.onToolDone(ev.trace)
          else if (ev.type === 'delta' && ev.text) callbacks.onDelta(ev.text)
          else if (ev.type === 'complete' && ev.response) finalData = ev.response
        } catch {
          // Ignore malformed partial frame
        }
      }
    }

    if (finalData) return { kind: 'ok', data: finalData }
    return await postAssistantTurn(message, messages, brief, sessionId)
  } catch {
    return await postAssistantTurn(message, messages, brief, sessionId)
  }
}
