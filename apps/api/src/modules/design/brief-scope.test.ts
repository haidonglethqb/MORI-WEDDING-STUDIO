import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { PlaceOrderService } from '../orders/place-order.service.js'
import { BriefScopeService } from './brief-scope.service.js'

const ownerEmail = `scope-owner-${Date.now()}@example.com`
const otherEmail = `scope-other-${Date.now()}@example.com`

describe('brief scope after approval', () => {
  const scopes = new BriefScopeService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('keeps the old approval and blocks a new order', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Scope' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'hash-approved',
        isFixture: true,
        approval: {
          create: {
            ownerUserId: owner.id,
            manifestHash: 'hash-approved',
            scopeFingerprint: 'scope-a',
            acknowledgementVersion: 'fixture-ack-1',
          },
        },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'scope-a',
        isFixture: true,
      },
    })

    await expect(
      scopes.change({
        actorUserId: other.id,
        requestId: request.id,
        scopeFingerprint: 'scope-b',
        expectedVersion: 0,
        idempotencyKey: 'scope-other',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      scopes.change({
        actorUserId: owner.id,
        requestId: request.id,
        scopeFingerprint: 'scope-b',
        expectedVersion: 4,
        idempotencyKey: 'scope-stale',
      }),
    ).rejects.toMatchObject({ response: { code: 'VERSION_CONFLICT' } })
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: revision.id } })).state).toBe('APPROVED')

    await scopes.change({
      actorUserId: owner.id,
      requestId: request.id,
      scopeFingerprint: 'scope-b',
      expectedVersion: 0,
      idempotencyKey: 'scope-once',
    })
    await scopes.change({
      actorUserId: owner.id,
      requestId: request.id,
      scopeFingerprint: 'scope-b',
      expectedVersion: 0,
      idempotencyKey: 'scope-once',
    })

    const stored = await prisma.serviceRequest.findUniqueOrThrow({ where: { id: request.id } })
    expect(stored.version).toBe(1)
    expect(stored.scopeFingerprint).toBe('scope-b')
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: revision.id } })).state).toBe('SUPERSEDED')
    const approval = await prisma.proofApproval.findUniqueOrThrow({ where: { revisionId: revision.id } })
    expect(approval.scopeFingerprint).toBe('scope-a')

    await expect(
      new PlaceOrderService().placeOrder({
        ownerUserId: owner.id,
        requestId: request.id,
        quoteId: quote.id,
        expectedVersion: 1,
        idempotencyKey: 'scope-order',
      }),
    ).rejects.toMatchObject({ response: { code: 'SCOPE_CHANGED' } })
    expect(await prisma.order.count({ where: { requestId: request.id } })).toBe(0)
    expect((await prisma.quote.findUniqueOrThrow({ where: { id: quote.id } })).state).toBe('ISSUED')
  })
})