import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { IssueQuoteService } from './issue-quote.service.js'

const email = `quote-${Date.now()}@example.com`

describe('IssueQuoteService', () => {
  const quotes = new IssueQuoteService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps a single issued quote when two issues race', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Quote' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const [first, second] = await Promise.all([
      quotes.issue({
        requestId: request.id,
        totalAmountVnd: 1_500_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        scopeFingerprint: 'scope-a',
        expiresAt,
        isFixture: true,
      }),
      quotes.issue({
        requestId: request.id,
        totalAmountVnd: 1_800_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        scopeFingerprint: 'scope-b',
        expiresAt,
        isFixture: true,
      }),
    ])

    const rows = await prisma.quote.findMany({ where: { requestId: request.id }, orderBy: { sequence: 'asc' } })
    const issued = rows.filter((row) => row.state === 'ISSUED')
    expect(rows).toHaveLength(2)
    expect(issued).toHaveLength(1)
    expect(rows.some((row) => row.state === 'SUPERSEDED')).toBe(true)
    expect([first.quoteId, second.quoteId]).toContain(issued[0]?.id)
    expect(issued[0]?.totalAmountVnd.toString()).toMatch(/1500000|1800000/)
  })
})