import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { StudioOrderService } from './studio-order.service.js'

const ownerEmail = `studio-order-owner-${Date.now()}@example.com`
const staffEmail = `studio-order-staff-${Date.now()}@example.com`
const otherEmail = `studio-order-other-${Date.now()}@example.com`

describe('studio order progress', () => {
  const studio = new StudioOrderService(new FulfillmentService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('shows assigned orders and advances only the next production step', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Studio order secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'studio-order-hash',
        trimWidthMm: 100,
        trimHeightMm: 150,
        profileWidthMm: 100,
        profileHeightMm: 150,
        fontsReady: true,
        isFixture: true,
        approval: {
          create: { ownerUserId: owner.id, manifestHash: 'studio-order-hash', acknowledgementVersion: 'ack-1' },
        },
      },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ACCEPTED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        expiresAt: new Date(Date.now() + 86_400_000),
        scopeFingerprint: 'studio-order-hash',
        isFixture: true,
      },
    })
    const order = await prisma.order.create({
      data: {
        requestId: request.id,
        quoteId: quote.id,
        ownerUserId: owner.id,
        status: 'SUBMITTED',
        totalAmountVnd: 900_000n,
        isFixture: true,
        physical: { create: { proofRevisionId: revision.id } },
      },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })

    await expect(studio.list(owner.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(await studio.list(other.id)).toEqual([])
    await expect(studio.read(other.id, order.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(studio.advance(staff.id, order.id, 'physical')).rejects.toBeInstanceOf(ConflictException)

    await prisma.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } })
    const started = await studio.advance(staff.id, order.id, 'physical')
    expect(started.status).toBe('IN_FULFILLMENT')
    const visible = await studio.list(staff.id)
    expect(visible).toEqual([
      expect.objectContaining({
        orderId: order.id,
        status: 'IN_FULFILLMENT',
        isFixture: true,
        physicalStage: 'IN_PRODUCTION',
        digitalStage: null,
      }),
    ])
    expect(JSON.stringify(visible)).not.toContain('Studio order secret')
    expect(JSON.stringify(visible)).not.toContain(ownerEmail)
  })
})
