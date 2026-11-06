/**
 * Adversarial Challenge Suite: Quota, IP Spoofing, Input Boundaries & Outage Handling
 * Empirical verification of PR-00 Security & Gateway invariants.
 */
import { describe, expect, it, vi } from 'vitest'
import { HttpException, HttpStatus, UnprocessableEntityException } from '@nestjs/common'
import { AssistantController } from './assistant.controller.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import type { RecommendationService } from './recommendation.service.js'
import type { AiToolBoundary } from './ai-tool-boundary.js'
import type { IdentityService } from '../identity/identity.service.js'
import type { AssistantOrchestratorService } from './assistant-orchestrator.service.js'

describe('Adversarial Challenge: Quota, Boundaries & Outages (PR-00)', () => {
  const dummyRecs = { recommend: vi.fn() } as unknown as RecommendationService
  const dummyTools = { run: vi.fn() } as unknown as AiToolBoundary
  const dummyIdentity = {
    currentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  } as unknown as IdentityService
  const dummyOrch = {
    handleChat: vi.fn().mockResolvedValue({ reply: 'OK', meta: { fallbackTier: 1 } }),
  } as unknown as AssistantOrchestratorService

  describe('1. Quota & IP Spoofing Challenge', () => {
    it('does not grant infinite quota when client injects arbitrary X-Forwarded-For headers', async () => {
      const subjects: string[] = []
      const quota = {
        reserve: vi.fn().mockImplementation((sub: string) => {
          subjects.push(sub)
          return Promise.resolve()
        }),
      } as unknown as AssistantQuotaService

      const controller = new AssistantController(dummyRecs, quota, dummyTools, dummyIdentity, dummyOrch)
      const spoofedIps = ['1.2.3.4', '8.8.8.8', '10.0.0.1', '192.168.1.1', '203.0.113.50']
      for (const fakeIp of spoofedIps) {
        await controller.chat(
          undefined,
          undefined,
          { ip: '198.51.100.24', socket: { remoteAddress: '198.51.100.24' } },
          { message: `Probe ${fakeIp}` },
        )
      }

      expect(subjects).toHaveLength(5)
      expect(new Set(subjects).size).toBe(1)
      expect(subjects[0]).toMatch(/^anon:[a-f0-9]{64}$/)
    })

    it('binds quota to mori_assistant_session_id cookie regardless of IP changes', async () => {
      const subjects: string[] = []
      const quota = {
        reserve: vi.fn().mockImplementation((sub: string) => {
          subjects.push(sub)
          return Promise.resolve()
        }),
      } as unknown as AssistantQuotaService

      const controller = new AssistantController(dummyRecs, quota, dummyTools, dummyIdentity, dummyOrch)
      const cookie = 'mori_assistant_session_id=attacker-session-id'
      await controller.chat(cookie, undefined, { ip: '1.1.1.1' }, { message: 'Q1' })
      await controller.chat(cookie, undefined, { ip: '2.2.2.2' }, { message: 'Q2' })

      expect(subjects[0]).toBe(subjects[1])
      expect(subjects[0]).toMatch(/^anon:[a-f0-9]{64}$/)
    })

    it('returns HTTP 429 (AI_QUOTA_EXCEEDED) and never 409 when quota is exhausted', async () => {
      const quota = new AssistantQuotaService()
      const testSubject = `adversarial-quota-test-${Date.now()}`
      for (let i = 0; i < 5; i++) await quota.reserve(testSubject, 5)

      let caught: unknown = null
      try {
        await quota.reserve(testSubject, 5)
      } catch (err) {
        caught = err
      }

      expect(caught).toBeInstanceOf(HttpException)
      const httpErr = caught as HttpException
      expect(httpErr.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
      expect(httpErr.getStatus()).toBe(429)
      expect(httpErr.getStatus()).not.toBe(HttpStatus.CONFLICT)
      expect(httpErr.getStatus()).not.toBe(409)
      const body = httpErr.getResponse() as { code?: string }
      expect(body.code).toBe('AI_QUOTA_EXCEEDED')
    })

    it('returns HTTP 503 (ASSISTANT_UNAVAILABLE) and never 409 during DB failure in production', async () => {
      const origAppEnv = process.env['APP_ENV']
      process.env['APP_ENV'] = 'production'
      try {
        const quota = new AssistantQuotaService()
        let caught: unknown = null
        try {
          await quota.reserve('crash-subject\0-null-byte', 5)
        } catch (err) {
          caught = err
        }
        expect(caught).toBeInstanceOf(HttpException)
        const httpErr = caught as HttpException
        expect(httpErr.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE)
        expect(httpErr.getStatus()).toBe(503)
        expect(httpErr.getStatus()).not.toBe(HttpStatus.CONFLICT)
        expect(httpErr.getStatus()).not.toBe(409)
        const body = httpErr.getResponse() as { code?: string }
        expect(body.code).toBe('ASSISTANT_UNAVAILABLE')
      } finally {
        process.env['APP_ENV'] = origAppEnv
      }
    })
  })

  describe('2. DTO & Input Boundary Challenge', () => {
    const quota = { reserve: vi.fn().mockResolvedValue(undefined) } as unknown as AssistantQuotaService
    const controller = new AssistantController(dummyRecs, quota, dummyTools, dummyIdentity, dummyOrch)

    it('rejects empty and whitespace-only messages with 422', async () => {
      for (const invalid of ['', '   ', '\t\n\r  \n']) {
        await expect(
          controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: invalid }),
        ).rejects.toThrow(UnprocessableEntityException)
      }
    })

    it('rejects messages exceeding 4000 characters with 422', async () => {
      await expect(
        controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: 'm'.repeat(4001) }),
      ).rejects.toThrow(UnprocessableEntityException)
    })

    it('accepts messages at exact boundary limits 1 and 4000 characters', async () => {
      expect(await controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: 'A' })).toBeDefined()
      expect(
        await controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: 'B'.repeat(4000) }),
      ).toBeDefined()
    })

    it('rejects non-string message types with 422', async () => {
      for (const nonString of [12345, null, true, {}, ['hello']]) {
        await expect(
          controller.chat(undefined, undefined, { ip: '127.0.0.1' }, { message: nonString }),
        ).rejects.toThrow(UnprocessableEntityException)
      }
    })

    it('rejects missing or malformed body payloads with 422', async () => {
      for (const badBody of [null, undefined, {}, { otherField: 'val' }]) {
        await expect(controller.chat(undefined, undefined, { ip: '127.0.0.1' }, badBody)).rejects.toThrow(
          UnprocessableEntityException,
        )
      }
    })

    it('rejects invalid history schema or non-UUID clientMessageId with 422', async () => {
      await expect(
        controller.chat(
          undefined,
          undefined,
          { ip: '127.0.0.1' },
          { message: 'Valid', history: [{ role: 'system', content: 'test' }] },
        ),
      ).rejects.toThrow(UnprocessableEntityException)

      await expect(
        controller.chat(
          undefined,
          undefined,
          { ip: '127.0.0.1' },
          { message: 'Valid', clientMessageId: 'not-a-uuid' },
        ),
      ).rejects.toThrow(UnprocessableEntityException)
    })
  })
})
