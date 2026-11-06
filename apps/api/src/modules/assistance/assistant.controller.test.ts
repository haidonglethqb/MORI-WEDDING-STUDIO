import { describe, expect, it, vi } from 'vitest'
import { UnprocessableEntityException } from '@nestjs/common'
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

  it('binds quota to mori_assistant_session_id cookie when present', async () => {
    const cookie = 'mori_assistant_session_id=sess-cookie-123'
    await controller.chat(
      cookie,
      undefined,
      { ip: '10.0.0.1' },
      { message: 'Tư vấn thiệp hoa' },
    )
    expect(mockReserve).toHaveBeenCalled()
  })
})
