import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { UnprocessableEntityException } from '@nestjs/common'
import { AiLogService } from './ai-log.service.js'
import { AssistantController } from './assistant.controller.js'
import type { RecommendationService } from './recommendation.service.js'
import type { AssistantQuotaService } from './assistant-quota.service.js'
import type { AiToolBoundary } from './ai-tool-boundary.js'
import type { IdentityService } from '../identity/identity.service.js'
import type { AssistantOrchestratorService } from './assistant-orchestrator.service.js'

describe('AssistantController runtime validation and actor identification', () => {
  const mockRecommendations = {
    recommend: vi.fn().mockResolvedValue({ provider: 'DISABLED', results: [] }),
  } as unknown as RecommendationService

  const mockReserve = vi.fn().mockResolvedValue(undefined)
  const mockQuota = {
    reserve: mockReserve,
  } as unknown as AssistantQuotaService

  const mockTools = {
    run: vi.fn(),
  } as unknown as AiToolBoundary

  const mockIdentity = {
    currentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  } as unknown as IdentityService

  const mockOrchestrator = {
    handleChat: vi.fn().mockResolvedValue({
      reply: 'Test response',
      updatedBrief: {},
      suggestedProducts: [],
      quickFollowUps: [],
      meta: { modelUsed: 'test', fallbackTier: 1, latencyMs: 50, groundedProductCount: 0 },
    }),
  } as unknown as AssistantOrchestratorService

  const controller = new AssistantController(
    mockRecommendations,
    mockQuota,
    mockTools,
    mockIdentity,
    mockOrchestrator,
  )

  it('rejects empty messages with UnprocessableEntityException', async () => {
    await expect(
      controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: '   ' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('rejects messages longer than 4000 characters with UnprocessableEntityException', async () => {
    const oversizedMessage = 'a'.repeat(4001)
    await expect(
      controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: oversizedMessage }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
  })

  it('accepts valid messages and extracts actor identity correctly', async () => {
    const res = await controller.chat(
      undefined,
      undefined,
      { ip: '192.168.1.5' },
      { message: 'Xin chào, tư vấn thiệp cưới' },
    )
    expect(res).toBeDefined()
    expect(res.reply).toBe('Test response')
    expect(mockReserve).toHaveBeenCalled()
  })

  it('binds quota to mori_assistant_session_id cookie with a strict limit of 5 messages for guests', async () => {
    mockReserve.mockClear()
    const cookie = 'mori_assistant_session_id=sess-cookie-123'
    await controller.chat(
      cookie,
      undefined,
      { ip: '10.0.0.1' },
      { message: 'Tư vấn thiệp hoa' },
    )
    expect(mockReserve).toHaveBeenCalledWith(expect.stringMatching(/^anon:/), 5)
  })

  describe('escalate & session polling', () => {
    let tempDir = ''
    afterEach(() => {
      delete process.env['MORI_AI_LOG_PATH']
      if (tempDir) rmSync(tempDir, { recursive: true, force: true })
    })

    it('escalates session and returns adminReplies on session lookup', async () => {
      tempDir = mkdtempSync(join(tmpdir(), 'mori-ctrl-'))
      process.env['MORI_AI_LOG_PATH'] = join(tempDir, 'ai-sessions.json')
      const logService = new AiLogService()
      const ctrl = new AssistantController(
        mockRecommendations,
        mockQuota,
        mockTools,
        mockIdentity,
        mockOrchestrator,
        logService,
      )

      const empty = ctrl.getSession(undefined, undefined, 'sess-new-99')
      expect(empty.needsHumanSupport).toBe(false)
      expect(empty.adminReplies).toEqual([])

      const esc = await ctrl.escalate(
        undefined,
        undefined,
        { ip: '127.0.0.1' },
        { sessionId: 'sess-new-99', customerContact: '0901234567', reason: 'Cần báo giá thiết kế riêng' },
      )
      expect(esc.ok).toBe(true)
      expect(esc.session.needsHumanSupport).toBe(true)
      expect(esc.session.customerContact).toBe('0901234567')

      logService.addAdminReply('sess-new-99', { sender: 'Admin MORI', message: 'MORI đã tiếp nhận yêu cầu của bạn.' })
      const loaded = ctrl.getSession(undefined, undefined, 'sess-new-99')
      expect(loaded.needsHumanSupport).toBe(true)
      expect(loaded.adminReplies).toHaveLength(1)
      expect(loaded.adminReplies[0]?.message).toContain('MORI đã tiếp nhận')
    })
  })
})
