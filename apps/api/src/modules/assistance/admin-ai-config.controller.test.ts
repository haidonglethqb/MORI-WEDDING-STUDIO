import { describe, expect, it } from 'vitest'
import { AdminAiConfigController } from './admin-ai-config.controller.js'
import { AiConfigService } from './ai-config.service.js'
import { AiLogService } from './ai-log.service.js'
import { AiProviderTesterService } from './ai-provider-tester.service.js'
import type { IdentityService } from '../identity/identity.service.js'

describe('AdminAiConfigController', () => {
  const configService = new AiConfigService()
  const testerService = new AiProviderTesterService(configService)
  const logService = new AiLogService()
  const mockIdentity = {
    currentUser: () => Promise.resolve({ id: 'admin-1', role: 'ADMIN', status: 'ACTIVE' }),
  } as unknown as IdentityService

  const controller = new AdminAiConfigController(configService, logService, mockIdentity, testerService)

  const adminCookie = '__Host-mori_session=test-admin-token'

  it('rejects unauthenticated requests with 404', async () => {
    await expect(controller.getConfig(undefined)).rejects.toThrow()
  })

  it('retrieves masked config and model options', async () => {
    configService.updateConfig({ codexApiKey: 'sk-mock-key-for-admin-config-test' })
    const res = await controller.getConfig(adminCookie)
    expect(res.config).toBeDefined()
    expect(res.config.codexApiKeyMasked).toContain('...')
    expect(res.config.hasCodexApiKey).toBe(true)
    expect(res.availableCodexModels).toContain('gpt-6.1-sol')
    expect(res.availableGroqModels).toContain('openai/gpt-oss-120b')
  })

  it('updates provider and model configurations dynamically', async () => {
    const updateRes = await controller.updateConfig(adminCookie, {
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

  it('records and returns interaction logs', async () => {
    logService.recordTurn('sess-test-1', {
      userMessage: 'Test user message',
      modelUsed: 'gpt-6.1-sol',
      fallbackTier: 1,
      latencyMs: 1500,
      assistantReply: 'Test reply',
      suggestedProducts: [],
    })

    const sessions = await controller.getLogs(adminCookie)
    expect(sessions.length).toBeGreaterThan(0)
    expect(sessions[0]?.sessionId).toBe('sess-test-1')
    expect(sessions[0]?.turns[0]?.userMessage).toBe('Test user message')
    expect(sessions[0]?.turns[0]?.modelUsed).toBe('gpt-6.1-sol')
  })

  it('blocks SSRF attempts in testConnection', async () => {
    const metaRes = await controller.testConnection(adminCookie, {
      baseUrl: 'http://169.254.169.254/latest/meta-data',
    })
    expect(metaRes.ok).toBe(false)
    expect(metaRes.error).toContain('SSRF validation failed')

    const loopbackRes = await controller.testConnection(adminCookie, {
      baseUrl: 'http://127.0.0.1:4000',
    })
    expect(loopbackRes.ok).toBe(false)
    expect(loopbackRes.error).toContain('SSRF validation failed')

    const hostRes = await controller.testConnection(adminCookie, {
      baseUrl: 'https://attacker.example.com',
    })
    expect(hostRes.ok).toBe(false)
    expect(hostRes.error).toContain('SSRF validation failed')
  })
})
