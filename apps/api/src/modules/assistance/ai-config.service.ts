import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface AiSystemConfig {
  provider: 'CODEX' | 'GROQ' | 'LOCAL_ONLY'
  codexApiKey: string
  codexBaseUrl: string
  codexPrimaryModel: string
  codexFallbackModel: string
  groqApiKey: string
  groqPrimaryModel: string
  temperature: number
  timeoutMs: number
}

export interface MaskedAiConfig {
  provider: 'CODEX' | 'GROQ' | 'LOCAL_ONLY'
  codexApiKeyMasked: string
  hasCodexApiKey: boolean
  codexBaseUrl: string
  codexPrimaryModel: string
  codexFallbackModel: string
  groqApiKeyMasked: string
  hasGroqApiKey: boolean
  groqPrimaryModel: string
  temperature: number
  timeoutMs: number
}

const DEFAULT_CONFIG: AiSystemConfig = {
  provider: 'CODEX',
  codexApiKey: process.env['CODEX_API_KEY'] ?? 'sk-KPbpFQ47t8g4JZa5OIPwlYL3tLKu8xgBcqGy1aIKRSa1gFna',
  codexBaseUrl: process.env['CODEX_BASE_URL'] ?? 'https://api.modelapi.vn/v1',
  codexPrimaryModel: 'gpt-6.1-sol',
  codexFallbackModel: 'gpt-6.1-terra',
  groqApiKey: process.env['GROQ_API_KEY'] ?? '',
  groqPrimaryModel: 'openai/gpt-oss-120b',
  temperature: 0.3,
  timeoutMs: 28000,
}

@Injectable()
export class AiConfigService {
  private config: AiSystemConfig
  private readonly configPath: string

  constructor() {
    this.configPath = join(process.cwd(), '.data', 'ai-config.json')
    this.config = this.loadConfig()
  }

  getConfig(): AiSystemConfig {
    return { ...this.config }
  }

  getMaskedConfig(): MaskedAiConfig {
    return {
      provider: this.config.provider,
      codexApiKeyMasked: this.maskKey(this.config.codexApiKey),
      hasCodexApiKey: Boolean(this.config.codexApiKey),
      codexBaseUrl: this.config.codexBaseUrl,
      codexPrimaryModel: this.config.codexPrimaryModel,
      codexFallbackModel: this.config.codexFallbackModel,
      groqApiKeyMasked: this.maskKey(this.config.groqApiKey),
      hasGroqApiKey: Boolean(this.config.groqApiKey),
      groqPrimaryModel: this.config.groqPrimaryModel,
      temperature: this.config.temperature,
      timeoutMs: this.config.timeoutMs,
    }
  }

  updateConfig(updates: Partial<AiSystemConfig>): AiSystemConfig {
    const next: AiSystemConfig = { ...this.config }

    if (updates.provider) next.provider = updates.provider
    if (updates.codexApiKey !== undefined && updates.codexApiKey.trim()) {
      next.codexApiKey = updates.codexApiKey.trim()
    }
    if (updates.codexBaseUrl !== undefined && updates.codexBaseUrl.trim()) {
      next.codexBaseUrl = updates.codexBaseUrl.trim()
    }
    if (updates.codexPrimaryModel) next.codexPrimaryModel = updates.codexPrimaryModel
    if (updates.codexFallbackModel) next.codexFallbackModel = updates.codexFallbackModel
    if (updates.groqApiKey !== undefined && updates.groqApiKey.trim()) {
      next.groqApiKey = updates.groqApiKey.trim()
    }
    if (updates.groqPrimaryModel) next.groqPrimaryModel = updates.groqPrimaryModel
    if (typeof updates.temperature === 'number') next.temperature = updates.temperature
    if (typeof updates.timeoutMs === 'number') next.timeoutMs = updates.timeoutMs

    this.config = next
    this.saveConfig(this.config)
    return { ...this.config }
  }

  private loadConfig(): AiSystemConfig {
    try {
      if (existsSync(this.configPath)) {
        const raw = readFileSync(this.configPath, 'utf-8')
        const parsed = JSON.parse(raw) as Partial<AiSystemConfig>
        return { ...DEFAULT_CONFIG, ...parsed }
      }
    } catch {
      // Fallback to default
    }
    return { ...DEFAULT_CONFIG }
  }

  private saveConfig(cfg: AiSystemConfig): void {
    try {
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.configPath, JSON.stringify(cfg, null, 2), 'utf-8')
    } catch {
      // Ignore save errors
    }
  }

  private maskKey(key: string): string {
    if (!key) return ''
    if (key.length <= 8) return '****'
    return `${key.slice(0, 7)}...${key.slice(-4)}`
  }
}
