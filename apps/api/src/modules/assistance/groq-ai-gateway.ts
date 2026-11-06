import { Injectable } from '@nestjs/common'

export interface ModelCompletionResult<T> {
  data: T
  modelUsed: string
  fallbackTier: number
  latencyMs: number
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export const FAILOVER_MODELS = [
  { id: 'openai/gpt-oss-120b', timeoutMs: 8000 },
  { id: 'qwen/qwen3.8-27b', timeoutMs: 6000 },
  { id: 'openai/gpt-oss-20b', timeoutMs: 4000 },
]

@Injectable()
export class GroqAiGateway {
  private readonly apiKey: string

  constructor() {
    this.apiKey = process.env['GROQ_API_KEY'] ?? ''
  }

  async executeCompletion<T>(
    systemPrompt: string,
    userPrompt: string,
    modelOverrides?: Array<{ id: string; timeoutMs: number }>,
  ): Promise<ModelCompletionResult<T>> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured')
    }

    const models = modelOverrides ?? FAILOVER_MODELS
    const errors: string[] = []

    for (let tier = 0; tier < models.length; tier++) {
      const model = models[tier]
      if (!model) continue
      const start = Date.now()
      try {
        const payload = await this.callModel(model.id, systemPrompt, userPrompt, model.timeoutMs)
        const parsed = this.parseJsonContent<T>(payload)
        return {
          data: parsed,
          modelUsed: model.id,
          fallbackTier: tier + 1,
          latencyMs: Date.now() - start,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Tier ${tier + 1} (${model.id}) failed: ${msg}`)
      }
    }

    throw new Error(`All failover models exhausted: ${errors.join('; ')}`)
  }

  private async callModel(
    modelId: string,
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
  ): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 150)}`)
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const content = json.choices?.[0]?.message?.content
      if (!content) throw new Error('Empty completion content from model')
      return content
    } finally {
      clearTimeout(timer)
    }
  }

  private parseJsonContent<T>(raw: string): T {
    let cleaned = raw.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    return JSON.parse(cleaned) as T
  }
}
