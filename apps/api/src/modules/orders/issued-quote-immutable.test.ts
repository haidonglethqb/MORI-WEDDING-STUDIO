import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { editIssuedQuote, issueQuoteCommand } from './issue-quote-command.js'

const email = `quote-immutable-${Date.now()}@example.com`
const slug = `quote-book-${Date.now()}`

describe('issued quote immutability', () => {
  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.user.deleteMany({ where: { normalizedEmail: email } })
    await prisma.product.deleteMany({ where: { slug } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: slug } })
    await disconnectPrismaClient()
  })

  it('keeps the issued total after the price book changes', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Quote history' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const product = await prisma.product.create({
      data: {
        slug,
        name: 'Fixture quote card',
        type: 'PAPER',
        description: 'Fixture',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['minimalist'],
        colourTags: [],
        variants: { create: { shape: 'FLAT', availability: 'AVAILABLE' } },
      },
      include: { variants: true },
    })
    const book = await prisma.priceBook.create({
      data: {
        versionLabel: slug,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: {
            variantId: product.variants[0]?.id ?? '',
            quantityMin: 1,
            quantityMax: 10,
            unitAmountVnd: 40_000n,
            setupAmountVnd: 0n,
          },
        },
      },
      include: { rules: true },
    })
    const command = {
      requestId: request.id,
      totalAmountVnd: '1500000',
      shippingAmountVnd: '20000',
      taxAmountVnd: '10000',
      scopeFingerprint: 'fixture-scope',
      expiresAt: '2027-06-01T00:00:00.000Z',
      isFixture: true,
    }

    await expect(issueQuoteCommand({ ...command, role: 'ADMIN', ownerUserId: owner.id })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    )
    expect(await prisma.quote.count({ where: { requestId: request.id } })).toBe(0)

    const issued = await issueQuoteCommand(command)
    await prisma.priceRule.update({
      where: { id: book.rules[0]?.id ?? '' },
      data: { unitAmountVnd: 99_000n },
    })
    await expect(editIssuedQuote({ quoteId: issued.quoteId, totalAmountVnd: '1' })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    )
    await expect(editIssuedQuote({ quoteId: issued.quoteId })).rejects.toBeInstanceOf(ConflictException)

    const stored = await prisma.quote.findUniqueOrThrow({ where: { id: issued.quoteId } })
    expect(stored.totalAmountVnd).toBe(1_500_000n)
    expect(stored.state).toBe('ISSUED')
    expect((await prisma.priceRule.findUniqueOrThrow({ where: { id: book.rules[0]?.id ?? '' } })).unitAmountVnd).toBe(
      99_000n,
    )
  })
})