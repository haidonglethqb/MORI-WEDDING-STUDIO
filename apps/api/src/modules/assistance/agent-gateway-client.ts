import type { LlmToolCall, LlmToolMessage, LlmToolStepResult } from './agent-types.js'

export interface CandidateSpec {
  id: string
  endpoint: string
  apiKey: string
  timeoutMs: number
}

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
): Promise<Omit<LlmToolStepResult, 'modelUsed' | 'fallbackTier'>> {
  const hasMultimodal = messages.some((m) => Array.isArray(m.content))

  try {
    return await postChatCompletions(candidate, messages, tools, temperature)
  } catch (err) {
    if (hasMultimodal && err instanceof Error && err.message.startsWith('HTTP 400')) {
      return await postChatCompletions(candidate, stripImagesFromMessages(messages), tools, temperature)
    }
    throw err
  }
}

async function postChatCompletions(
  candidate: CandidateSpec,
  messages: LlmToolMessage[],
  tools: unknown[],
  temperature: number,
): Promise<Omit<LlmToolStepResult, 'modelUsed' | 'fallbackTier'>> {
  const controller = new AbortController()
  const effectiveTimeout = Math.max(candidate.timeoutMs, 45_000)
  const timer = setTimeout(() => controller.abort(), effectiveTimeout)
  const start = Date.now()

  try {
    const response = await fetch(candidate.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidate.apiKey}`,
      },
      body: JSON.stringify({
        model: candidate.id,
        messages,
        tools,
        tool_choice: 'auto',
        temperature,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 180)}`)
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
