import { parseOpenAiSseStream } from './agent-stream-parser.js'
import type { LlmToolCall, LlmToolMessage, LlmToolStepResult } from './agent-types.js'

export interface CandidateSpec {
  id: string
  endpoint: string
  apiKey: string
  timeoutMs: number
}

const STREAM_IDLE_TIMEOUT_MS = 180_000

function stripImagesFromMessages(messages: LlmToolMessage[]): LlmToolMessage[] {
  return messages.map((msg) => {
    if (!Array.isArray(msg.content)) return msg
    const textOnly = msg.content
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('\n')
    return { ...msg, content: textOnly || '(Khách có đính kèm hình ảnh tham khảo)' }
  })
}

export async function callToolCompletion(
  candidate: CandidateSpec,
  messages: LlmToolMessage[],
  tools: unknown[],
  temperature: number,
  onProgress?: (message: string) => void,
): Promise<Omit<LlmToolStepResult, 'modelUsed' | 'fallbackTier'>> {
  const hasMultimodal = messages.some((m) => Array.isArray(m.content))

  try {
    return await postChatCompletions(candidate, messages, tools, temperature, true, onProgress)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (hasMultimodal && msg.startsWith('HTTP 400')) {
      return await postChatCompletions(candidate, stripImagesFromMessages(messages), tools, temperature, true, onProgress)
    }
    if (msg.startsWith('HTTP 400')) {
      return await postChatCompletions(candidate, messages, tools, temperature, false, onProgress)
    }
    throw err
  }
}

async function postChatCompletions(
  candidate: CandidateSpec,
  messages: LlmToolMessage[],
  tools: unknown[],
  temperature: number,
  useStream: boolean,
  onProgress?: (message: string) => void,
): Promise<Omit<LlmToolStepResult, 'modelUsed' | 'fallbackTier'>> {
  const controller = new AbortController()
  const idleMs = Math.max(candidate.timeoutMs, STREAM_IDLE_TIMEOUT_MS)
  let timer = setTimeout(() => controller.abort(), idleMs)
  const resetWatchdog = () => {
    clearTimeout(timer)
    timer = setTimeout(() => controller.abort(), idleMs)
  }
  const start = Date.now()

  try {
    const payload: Record<string, unknown> = {
      model: candidate.id,
      messages,
      temperature,
      ...(useStream ? { stream: true } : {}),
    }
    if (tools.length > 0) {
      payload['tools'] = tools
      payload['tool_choice'] = 'auto'
    }

    const response = await fetch(candidate.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidate.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 180)}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (useStream && contentType.includes('text/event-stream') && response.body) {
      resetWatchdog()
      const streamed = await parseOpenAiSseStream(response.body, onProgress, resetWatchdog)
      return {
        content: streamed.content,
        toolCalls: streamed.toolCalls,
        latencyMs: Date.now() - start,
      }
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null; tool_calls?: LlmToolCall[] } }>
    }
    const msg = json.choices?.[0]?.message
    if (!msg) throw new Error('Empty assistant message from model')

    return {
      content: msg.content ?? '',
      toolCalls: Array.isArray(msg.tool_calls) ? msg.tool_calls : [],
      latencyMs: Date.now() - start,
    }
  } finally {
    clearTimeout(timer)
  }
}
