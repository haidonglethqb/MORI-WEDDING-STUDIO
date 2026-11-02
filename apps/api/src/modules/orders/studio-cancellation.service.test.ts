import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { FulfillmentService } from './fulfillment.service.js'
import { NotificationService } from '../notifications/notification.service.js'
import { StudioOrderService } from './studio-order.service.js'

const ownerEmail = `cancel-decide-owner-${Date.now()}@example.com`
const staffEmail = `cancel-decide-staff-${Date.now()}@example.com`
const otherEmail = `cancel-decide-other-${Date.now()}@example.com`

describe('studio cancellation decision', () => {
  const studio = new StudioOrderService(new FulfillmentService(), new CancellationRequestService())
  const notices = new NotificationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lets assigned staff cancel before work and tells the owner', async () => {
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
      data: { ownerUserId: owner.id, internalTitle: 'Cancel secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'DIGITAL', isFixture: true },
    })
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ACCEPTED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 0n,
        taxAmountVnd: 0n,
        expiresAt: new Date(Date.now() + 86_400_000),
        scopeFingerprint: 'cancel-decide',
        isFixture: true,
      },
    })
    const order = await prisma.order.create({
      data: {
        requestId: request.id,
        quoteId: quote.id,
        ownerUserId: owner.id,
        status: 'CONFIRMED',
        totalAmountVnd: 900_000n,
        isFixture: true,
      },
    })
    const cancellation = await prisma.cancellationRequest.create({
      data: { orderId: order.id, ownerUserId: owner.id, reason: 'Đổi ngày' },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })

    await expect(
      studio.decideCancellation(other.id, order.id, cancellation.id, true, 'Không được giao'),
    ).rejects.toBeInstanceOf(NotFoundException)
    await studio.decideCancellation(staff.id, order.id, cancellation.id, true, 'Chưa vào làm')

    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CANCELLED')
    const visible = await notices.list(owner.id)
    expect(visible.map((item) => item.plainText)).toContain('Đơn được hủy trước khi làm.')
    expect(JSON.stringify(visible)).not.toContain('Cancel secret')
    expect((await studio.read(staff.id, order.id)).cancellations[0]?.state).toBe('APPROVED')
  })
})
