import { Injectable } from '@nestjs/common'
import { AiConfigService } from './ai-config.service.js'
import { AiSsrfValidator } from './ai-ssrf-validator.js'

export interface TestConnectionParams {
  provider?: 'CODEX' | 'GROQ'
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface TestConnectionResult {
  ok: boolean
  status?: number
  latencyMs?: number
  model?: string
  sampleReply?: string
  error?: string
}

@Injectable()
export class AiProviderTesterService {
  constructor(private readonly configService: AiConfigService) {}

  async testConnection(params: TestConnectionParams): Promise<TestConnectionResult> {
    const cfg = this.configService.getConfig()
    const targetProvider = params.provider ?? cfg.provider
    const targetKey = params.apiKey?.trim() || (targetProvider === 'CODEX' ? cfg.codexApiKey : cfg.groqApiKey)
    const targetBaseUrl =
      params.baseUrl?.trim() ||
      (targetProvider === 'CODEX' ? cfg.codexBaseUrl : 'https://api.groq.com/openai/v1')
    const targetModel =
      params.model?.trim() ||
      (targetProvider === 'CODEX' ? cfg.codexPrimaryModel : cfg.groqPrimaryModel)

    if (!targetKey) {
      return { ok: false, error: 'Chưa có API Key được cấu hình' }
    }

    if (!/^[a-zA-Z0-9_.:/-]{1,64}$/.test(targetModel)) {
      return { ok: false, error: 'Tên model không hợp lệ' }
    }

    const ssrfCheck = await AiSsrfValidator.validateTargetUrl(targetBaseUrl)
    if (!ssrfCheck.valid) {
      return { ok: false, error: `SSRF validation failed: ${ssrfCheck.reason}` }
    }

    const endpoint = `${targetBaseUrl.replace(/\/+$/, '')}/chat/completions`
    const start = Date.now()
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)

      const response = await fetch(endpoint, {
        method: 'POST',
        redirect: 'error',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${targetKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Xin chào nghệ nhân MORI!' }],
          temperature: 0.3,
          max_tokens: 30,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer))

      if (!response.ok) {
        const text = await response.text()
        return { ok: false, status: response.status, error: text.slice(0, 200) }
      }

      const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const reply = json.choices?.[0]?.message?.content ?? ''
      return {
        ok: true,
        latencyMs: Date.now() - start,
        model: targetModel,
        sampleReply: reply.slice(0, 150),
      }
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }
}
