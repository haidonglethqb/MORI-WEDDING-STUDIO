import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { AiConfigService } from './ai-config.service.js'

describe('GroqAiGateway', () => {
  let configService: AiConfigService

  beforeEach(() => {
    configService = new AiConfigService()
    configService.updateConfig({
      provider: 'GROQ',
      groqApiKey: 'test-mock-key',
      groqPrimaryModel: 'openai/gpt-oss-120b',
    })
  })

  it('parses valid json wrapped in markdown code fences', async () => {
    const gateway = new GroqAiGateway(configService)
    const mockJson = { message: 'Xin chào', score: 10 }
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: '```json\n{"message": "Xin chào", "score": 10}\n```' } }],
        }),
    } as unknown as Response)

    const result = await gateway.executeCompletion<{ message: string; score: number }>(
      'system prompt',
      'user prompt',
    )
    expect(result.data).toEqual(mockJson)
    expect(result.fallbackTier).toBe(1)
    expect(result.modelUsed).toBe('openai/gpt-oss-120b')
    spy.mockRestore()
  })

  it('fails over to secondary model when primary fails', async () => {
    const gateway = new GroqAiGateway(configService)
    const mockSecondResult = { reply: 'Fallback thành công' }

    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: () => Promise.resolve('Service Unavailable'),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: JSON.stringify(mockSecondResult) } }],
          }),
      } as unknown as Response)

    const result = await gateway.executeCompletion<{ reply: string }>('sys', 'user')
    expect(result.data).toEqual(mockSecondResult)
    expect(result.fallbackTier).toBe(2)
    expect(result.modelUsed).toBe('qwen/qwen3.8-27b')
    spy.mockRestore()
  })

  it('throws descriptive error when all failover models fail', async () => {
    const gateway = new GroqAiGateway(configService)
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    } as unknown as Response)

    await expect(gateway.executeCompletion('sys', 'user')).rejects.toThrow(
      /All failover models exhausted/,
    )
    spy.mockRestore()
  })
})
