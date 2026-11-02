import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from '../invitations/invitation.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { OrderConfirmService } from './order-confirm.service.js'
import { PlaceOrderService } from './place-order.service.js'

const ownerEmail = `history-owner-${Date.now()}@example.com`
const staffEmail = `history-staff-${Date.now()}@example.com`

describe('completed digital order', () => {
  const invitations = new InvitationService()
  const orders = new PlaceOrderService()
  const confirm = new OrderConfirmService()
  const fulfillment = new FulfillmentService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('stays handed over after the invitation is unpublished', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await invitations.createProject(owner.id, 'History')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({
      where: { invitationId: created.id, revokedAt: null },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'DIGITAL', isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ISSUED',
        totalAmountVnd: 500_000n,
        expiresAt: new Date(Date.now() + 60_000),
        scopeFingerprint: 'history-fixture',
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        isFixture: true,
      },
    })
    const placed = await orders.placeOrder({
      ownerUserId: owner.id,
      requestId: request.id,
      quoteId: quote.id,
      expectedVersion: 0,
      idempotencyKey: 'history-key',
    })
    await confirm.confirm(staff.id, placed.orderId)
    await fulfillment.advanceDigital(placed.orderId, 'IN_PROGRESS')
    await fulfillment.advanceDigital(placed.orderId, 'READY_FOR_HANDOVER')
    const handed = await fulfillment.advanceDigital(placed.orderId, 'HANDED_OVER')
    expect(handed.status).toBe('COMPLETED')

    const published = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    await invitations.unpublish(owner.id, created.id, published.draftVersion)
    await expect(invitations.readPublished(handle.slug)).rejects.toBeInstanceOf(NotFoundException)
    await expect(fulfillment.advanceDigital(placed.orderId, 'IN_PROGRESS')).rejects.toBeInstanceOf(
      ConflictException,
    )

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: placed.orderId },
      include: { digital: true },
    })
    expect(order.status).toBe('COMPLETED')
    expect(order.totalAmountVnd).toBe(500_000n)
    expect(order.digital?.stage).toBe('HANDED_OVER')
  })
})