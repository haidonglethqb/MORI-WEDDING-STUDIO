import { afterAll, describe, expect, it } from 'vitest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { AssistantQuotaService } from './assistant-quota.service.js'
import { RecommendationService } from './recommendation.service.js'

const subject = `ip:quota-${Date.now()}`

describe('assistant quota and grounding', () => {
  const quota = new AssistantQuotaService()
  const recommendations = new RecommendationService()

  afterAll(async () => {
    await getPrismaClient().aiUsageBucket.deleteMany({ where: { subject } })
    await disconnectPrismaClient()
  })

  it('stops an anonymous subject with 429 after five questions and asks when budget is unclear', async () => {
    for (let count = 0; count < 5; count += 1) await quota.reserve(subject, 5)
    
    let caughtError: unknown = null
    try {
      await quota.reserve(subject, 5)
    } catch (err: unknown) {
      caughtError = err
    }
    expect(caughtError).toBeInstanceOf(HttpException)
    if (caughtError instanceof HttpException) {
      expect(caughtError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
    }

    const ranked = await recommendations.recommend({
      productType: 'PAPER',
      shape: 'FLAT',
      styles: ['minimalist'],
      colours: [],
      quantity: 1,
      budgetVnd: 100_000n,
      budgetBasis: 'UNKNOWN',
    })
    expect(ranked.provider).toBe('DISABLED')
    expect(ranked.clarification).toBe('Is that budget the total or the amount per card?')
    expect(ranked.results).toEqual([])
  })
})
