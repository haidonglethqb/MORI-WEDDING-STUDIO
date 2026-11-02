import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { IssueQuoteService } from './issue-quote.service.js'
import { PlaceOrderService } from './place-order.service.js'
import { QuoteOfferService } from './quote-offer.service.js'

const ownerEmail = `offer-owner-${Date.now()}@example.com`
const staffEmail = `offer-staff-${Date.now()}@example.com`
const otherEmail = `offer-other-${Date.now()}@example.com`

describe('fixture quote offer', () => {
  const offers = new QuoteOfferService(new IssueQuoteService(), new PlaceOrderService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('issues a fixture quote and lets the owner place the order', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Offer secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })
    await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'offer-hash',
        isFixture: true,
        approval: {
          create: {
            ownerUserId: owner.id,
            manifestHash: 'offer-hash',
            acknowledgementVersion: 'ack-1',
          },
        },
      },
    })

    await expect(
      offers.issueFixture({
        actorUserId: staff.id,
        requestId: request.id,
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        scopeFingerprint: 'offer-hash',
        expiresAt: new Date(Date.now() + 86_400_000),
        isFixture: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    const issued = await offers.issueFixture({
      actorUserId: staff.id,
      requestId: request.id,
      totalAmountVnd: 900_000n,
      shippingAmountVnd: 20_000n,
      taxAmountVnd: 10_000n,
      scopeFingerprint: 'offer-hash',
      expiresAt: new Date(Date.now() + 86_400_000),
      isFixture: true,
    })
    const visible = await offers.listForCustomer(owner.id, request.id)
    expect(visible).toEqual([
      expect.objectContaining({
        quoteId: issued.quoteId,
        totalAmountVnd: '900000',
        shippingAmountVnd: '20000',
        taxAmountVnd: '10000',
        isFixture: true,
        state: 'ISSUED',
        requestVersion: 0,
      }),
    ])
    expect(JSON.stringify(visible)).not.toContain('Offer secret')
    await expect(offers.listForCustomer(other.id, request.id)).rejects.toBeInstanceOf(NotFoundException)

    const placed = await offers.place({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: issued.quoteId,
      expectedVersion: 0,
      idempotencyKey: 'offer-place',
    })
    expect(placed.status).toBe('SUBMITTED')
    expect(placed.totalAmountVnd).toBe('900000')
    expect(placed.messageCode).toBe('ORDER_REQUEST_RECEIVED')
  })
})