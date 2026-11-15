import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { AdminAiConfigController } from './admin-ai-config.controller.js'
import { AiConfigService } from './ai-config.service.js'
import { AiLogService } from './ai-log.service.js'
import { AiProviderTesterService } from './ai-provider-tester.service.js'
import type { IdentityService } from '../identity/identity.service.js'

describe('AdminAiConfigController', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'mori-admin-ai-'))
  process.env['MORI_AI_LOG_PATH'] = join(tempDir, 'ai-sessions.json')
  const configService = new AiConfigService()
  const testerService = new AiProviderTesterService(configService)
  const logService = new AiLogService()

  afterAll(() => {
    delete process.env['MORI_AI_LOG_PATH']
    rmSync(tempDir, { recursive: true, force: true })
  })
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

  it('allows both ADMIN and STUDIO to read logs and reply to sessions while keeping config ADMIN-only', async () => {
    logService.markEscalated('sess-esc-admin', {
      customerContact: '0901234567',
      reason: 'Cần tư vấn thiết kế riêng',
    })

    const studioIdentity = {
      currentUser: () => Promise.resolve({ id: 'studio-1', role: 'STUDIO', status: 'ACTIVE', displayName: 'Studio Stylist' }),
    } as unknown as IdentityService
    const studioController = new AdminAiConfigController(configService, logService, studioIdentity, testerService)

    await expect(studioController.getConfig(adminCookie)).rejects.toThrow()
    const logs = await studioController.getLogs(adminCookie)
    expect(logs.some((s) => s.sessionId === 'sess-esc-admin')).toBe(true)

    const replyRes = await studioController.replyToSession(adminCookie, 'sess-esc-admin', {
      message: 'Chào bạn, MORI Studio đã nhận thông tin của bạn rồi nhé!',
      resolveEscalation: true,
    })
    expect(replyRes.ok).toBe(true)
    expect(replyRes.session.adminReplies).toHaveLength(1)
    expect(replyRes.session.adminReplies?.[0]?.sender).toBe('Studio Stylist')
    expect(replyRes.session.needsHumanSupport).toBe(false)

    const customerIdentity = {
      currentUser: () => Promise.resolve({ id: 'cust-1', role: 'CUSTOMER', status: 'ACTIVE' }),
    } as unknown as IdentityService
    const customerController = new AdminAiConfigController(configService, logService, customerIdentity, testerService)
    await expect(customerController.getLogs(adminCookie)).rejects.toThrow()
    await expect(
      customerController.replyToSession(adminCookie, 'sess-esc-admin', { message: 'Hack' }),
    ).rejects.toThrow()
  })
})
