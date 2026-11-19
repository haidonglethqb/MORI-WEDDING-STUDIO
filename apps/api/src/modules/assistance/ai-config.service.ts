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
  defaultUserDailyLimit: number | null
  userDailyLimits: Record<string, number>
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
  defaultUserDailyLimit: number | null
}

function readSecret(envVarName: string, secretFileName: string): string {
  const directEnv = process.env[envVarName]?.trim()
  if (directEnv) return directEnv
  const fileEnv = process.env[`${envVarName}_FILE`]?.trim()
  const candidateFiles = [fileEnv, `/run/secrets/${secretFileName}`].filter(Boolean) as string[]
  for (const filePath of candidateFiles) {
    try {
      if (existsSync(filePath)) {
        const val = readFileSync(filePath, 'utf-8').trim()
        if (val) return val
      }
    } catch {
      // Ignore read errors
    }
  }
  return ''
}

function normalizeLimit(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const num = Number(raw)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.min(100_000, Math.floor(num))
}

const DEFAULT_CONFIG: AiSystemConfig = {
  provider: 'CODEX',
  codexApiKey: readSecret('CODEX_API_KEY', 'CODEX_API_KEY'),
  codexBaseUrl: process.env['CODEX_BASE_URL'] ?? 'https://api.modelapi.vn/v1',
  codexPrimaryModel: 'gpt-6.1-sol',
  codexFallbackModel: 'gpt-6.1-terra',
  groqApiKey: readSecret('GROQ_API_KEY', 'GROQ_API_KEY'),
  groqPrimaryModel: 'openai/gpt-oss-120b',
  temperature: 0.3,
  timeoutMs: 28000,
  defaultUserDailyLimit: null,
  userDailyLimits: {},
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
    return { ...this.config, userDailyLimits: { ...this.config.userDailyLimits } }
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
      defaultUserDailyLimit: this.config.defaultUserDailyLimit,
    }
  }

  getUserDailyLimit(userId: string): number | null {
    const override = this.config.userDailyLimits[userId]
    return typeof override === 'number' && Number.isFinite(override) && override >= 0
      ? override
      : this.config.defaultUserDailyLimit
  }

  getCustomUserLimit(userId: string): number | null {
    const override = this.config.userDailyLimits[userId]
    return typeof override === 'number' && Number.isFinite(override) && override >= 0 ? override : null
  }

  setUserDailyLimit(userId: string, rawLimit: unknown): number | null {
    const limit = normalizeLimit(rawLimit)
    const nextMap = { ...this.config.userDailyLimits }
    if (limit === null) delete nextMap[userId]
    else nextMap[userId] = limit
    this.config = { ...this.config, userDailyLimits: nextMap }
    this.saveConfig(this.config)
    return limit
  }

  setDefaultUserDailyLimit(rawLimit: unknown): number | null {
    const limit = normalizeLimit(rawLimit)
    this.config = { ...this.config, defaultUserDailyLimit: limit }
    this.saveConfig(this.config)
    return limit
  }

  updateConfig(updates: Partial<AiSystemConfig>): AiSystemConfig {
    const next: AiSystemConfig = { ...this.config, userDailyLimits: { ...this.config.userDailyLimits } }
    if (updates.provider) next.provider = updates.provider
    if (updates.codexApiKey !== undefined && updates.codexApiKey.trim()) next.codexApiKey = updates.codexApiKey.trim()
    if (updates.codexBaseUrl !== undefined && updates.codexBaseUrl.trim()) next.codexBaseUrl = updates.codexBaseUrl.trim()
    if (updates.codexPrimaryModel) next.codexPrimaryModel = updates.codexPrimaryModel
    if (updates.codexFallbackModel) next.codexFallbackModel = updates.codexFallbackModel
    if (updates.groqApiKey !== undefined && updates.groqApiKey.trim()) next.groqApiKey = updates.groqApiKey.trim()
    if (updates.groqPrimaryModel) next.groqPrimaryModel = updates.groqPrimaryModel
    if (typeof updates.temperature === 'number') next.temperature = updates.temperature
    if (typeof updates.timeoutMs === 'number') next.timeoutMs = updates.timeoutMs
    if (updates.defaultUserDailyLimit !== undefined) {
      next.defaultUserDailyLimit = normalizeLimit(updates.defaultUserDailyLimit)
    }
    this.config = next
    this.saveConfig(this.config)
    return this.getConfig()
  }

  private loadConfig(): AiSystemConfig {
    const baseDefaults: AiSystemConfig = {
      ...DEFAULT_CONFIG,
      codexApiKey: readSecret('CODEX_API_KEY', 'CODEX_API_KEY'),
      groqApiKey: readSecret('GROQ_API_KEY', 'GROQ_API_KEY'),
      userDailyLimits: {},
    }
    try {
      if (existsSync(this.configPath)) {
        const parsed = JSON.parse(readFileSync(this.configPath, 'utf-8')) as Partial<AiSystemConfig>
        delete parsed.codexApiKey
        delete parsed.groqApiKey
        const rawLimits = parsed.userDailyLimits && typeof parsed.userDailyLimits === 'object' ? parsed.userDailyLimits : {}
        const cleanLimits: Record<string, number> = {}
        for (const [uid, val] of Object.entries(rawLimits)) {
          const norm = normalizeLimit(val)
          if (norm !== null) cleanLimits[uid] = norm
        }
        return {
          ...baseDefaults,
          ...parsed,
          defaultUserDailyLimit: parsed.defaultUserDailyLimit !== undefined ? normalizeLimit(parsed.defaultUserDailyLimit) : null,
          userDailyLimits: cleanLimits,
        }
      }
    } catch {
      // Fallback to default
    }
    return baseDefaults
  }

  private saveConfig(cfg: AiSystemConfig): void {
    try {
      const dir = dirname(this.configPath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      const { codexApiKey: _c, groqApiKey: _g, ...sanitized } = cfg
      writeFileSync(this.configPath, JSON.stringify(sanitized, null, 2), 'utf-8')
    } catch {
      // Ignore save errors
    }
  }

  private maskKey(key: string): string {
    if (!key) return ''
    return key.length <= 8 ? '****' : `${key.slice(0, 7)}...${key.slice(-4)}`
  }
}
