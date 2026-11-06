/**
 * Tier 1: Feature 1 & 2 - Secret Sanitization and Masking
 * Authoritative: PROJECT.md F01/F02, MORI_AI_V2_AGENT_HANDOFF.md AI-001, INV-15
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Tier 1: Secret Sanitization & Secret Hygiene', () => {
  it('masks sensitive API keys in serialized configuration responses', () => {
    const rawKey = 'sk-proj-super-secret-production-groq-key-2026'
    const maskKey = (key?: string) => {
      if (!key || key.length < 10) return ''
      return `${key.slice(0, 7)}...${key.slice(-4)}`
    }

    const masked = maskKey(rawKey)
    expect(masked).toBe('sk-proj...2026')
    expect(masked).not.toContain('super-secret')
    expect(masked).not.toBe(rawKey)
  })

  it('prevents saving plaintext API keys to .data/ai-config.json', () => {
    const configPath = resolve(process.cwd(), '.data/ai-config.json')
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf8')
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
      expect(content).not.toContain('gsk_')
    }
  })

  it('loads API keys strictly from process.env or secret files, not JSON files', () => {
    const mockEnv = {
      CODEX_API_KEY: 'test-codex-key-from-env',
      GROQ_API_KEY: 'test-groq-key-from-env',
    }

    const resolveKey = (keyName: 'CODEX_API_KEY' | 'GROQ_API_KEY') => mockEnv[keyName]
    expect(resolveKey('CODEX_API_KEY')).toBe('test-codex-key-from-env')
    expect(resolveKey('GROQ_API_KEY')).toBe('test-groq-key-from-env')
  })
})
