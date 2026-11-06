import { describe, expect, it } from 'vitest'
import { AdminAiConfigController } from './admin-ai-config.controller.js'
import { AiConfigService } from './ai-config.service.js'
import type { IdentityService } from '../identity/identity.service.js'

describe('AdminAiConfigController', () => {
  const configService = new AiConfigService()
  const mockIdentity = {
    currentUser: () => Promise.resolve({ id: 'admin-1', role: 'ADMIN', status: 'ACTIVE' }),
  } as unknown as IdentityService

  const controller = new AdminAiConfigController(configService, mockIdentity)

  it('retrieves masked config and model options', async () => {
    const res = await controller.getConfig(undefined)
    expect(res.config).toBeDefined()
    expect(res.config.codexApiKeyMasked).toContain('...')
    expect(res.availableCodexModels).toContain('gpt-6.1-sol')
    expect(res.availableGroqModels).toContain('openai/gpt-oss-120b')
  })

  it('updates provider and model configurations dynamically', async () => {
    const updateRes = await controller.updateConfig(undefined, {
      provider: 'CODEX',
      codexPrimaryModel: 'gpt-6.1-sol',
      codexFallbackModel: 'gpt-6.1-terra',
    })
    expect(updateRes.success).toBe(true)
    expect(updateRes.updatedProvider).toBe('CODEX')

    const current = configService.getConfig()
    expect(current.provider).toBe('CODEX')
    expect(current.codexPrimaryModel).toBe('gpt-6.1-sol')
  })
})
