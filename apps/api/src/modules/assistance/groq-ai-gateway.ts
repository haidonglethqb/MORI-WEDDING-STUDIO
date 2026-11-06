import { Injectable } from '@nestjs/common'
import { AiConfigService, type AiSystemConfig } from './ai-config.service.js'

export interface ModelCompletionResult<T> {
  data: T
  modelUsed: string
  fallbackTier: number
  latencyMs: number
}

interface ProviderCandidate {
  id: string
  endpoint: string
  apiKey: string
  timeoutMs: number
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

@Injectable()
export class GroqAiGateway {
  private readonly config: AiConfigService

  constructor(configService?: AiConfigService) {
    this.config = configService ?? new AiConfigService()
  }

  async executeCompletion<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<ModelCompletionResult<T>> {
    const config = this.config.getConfig()
    if (config.provider === 'LOCAL_ONLY') {
      throw new Error('Configured to use Local Deterministic Atelier fallback')
    }

    const candidates = this.buildCandidates(config)
    if (candidates.length === 0) {
      throw new Error('No AI provider API key configured')
    }

    const errors: string[] = []
    for (let tier = 0; tier < candidates.length; tier++) {
      const candidate = candidates[tier]
      if (!candidate) continue
      const start = Date.now()
      try {
        const payload = await this.callEndpoint(
          candidate.endpoint,
          candidate.apiKey,
          candidate.id,
          systemPrompt,
          userPrompt,
          candidate.timeoutMs,
          config.temperature,
        )
        const parsed = this.parseJsonContent<T>(payload)
        return {
          data: parsed,
          modelUsed: candidate.id,
          fallbackTier: tier + 1,
          latencyMs: Date.now() - start,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Tier ${tier + 1} (${candidate.id}) failed: ${msg}`)
      }
    }

    throw new Error(`All failover models exhausted: ${errors.join('; ')}`)
  }

  private buildCandidates(cfg: AiSystemConfig): ProviderCandidate[] {
    const list: ProviderCandidate[] = []
    const codexEndpoint = `${cfg.codexBaseUrl.replace(/\/+$/, '')}/chat/completions`

    if (cfg.provider === 'CODEX') {
      if (cfg.codexApiKey) {
        list.push({ id: cfg.codexPrimaryModel, endpoint: codexEndpoint, apiKey: cfg.codexApiKey, timeoutMs: cfg.timeoutMs })
        list.push({ id: cfg.codexFallbackModel, endpoint: codexEndpoint, apiKey: cfg.codexApiKey, timeoutMs: 10000 })
      }
      if (cfg.groqApiKey) {
        list.push({ id: cfg.groqPrimaryModel, endpoint: GROQ_ENDPOINT, apiKey: cfg.groqApiKey, timeoutMs: 8000 })
      }
    } else if (cfg.provider === 'GROQ') {
      if (cfg.groqApiKey) {
        list.push({ id: cfg.groqPrimaryModel, endpoint: GROQ_ENDPOINT, apiKey: cfg.groqApiKey, timeoutMs: 8000 })
        list.push({ id: 'qwen/qwen3.8-27b', endpoint: GROQ_ENDPOINT, apiKey: cfg.groqApiKey, timeoutMs: 6000 })
      }
      if (cfg.codexApiKey) {
        list.push({ id: cfg.codexPrimaryModel, endpoint: codexEndpoint, apiKey: cfg.codexApiKey, timeoutMs: cfg.timeoutMs })
      }
    }

    return list
  }

  private async callEndpoint(
    endpoint: string,
    apiKey: string,
    modelId: string,
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number,
    temperature: number,
  ): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
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
