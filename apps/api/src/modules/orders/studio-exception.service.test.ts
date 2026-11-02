import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { FulfillmentService } from './fulfillment.service.js'
import { NotificationService } from '../notifications/notification.service.js'
import { OrderReadService } from './order-read.service.js'
import { StudioOrderService } from './studio-order.service.js'

const ownerEmail = `hold-owner-${Date.now()}@example.com`
const staffEmail = `hold-staff-${Date.now()}@example.com`
const otherEmail = `hold-other-${Date.now()}@example.com`

describe('studio order exceptions', () => {
  const studio = new StudioOrderService(new FulfillmentService())
  const reader = new OrderReadService()
  const notices = new NotificationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lets assigned staff hold an order and keeps other steps in their own stage', async () => {
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
      data: { ownerUserId: owner.id, internalTitle: 'Hold secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
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
        scopeFingerprint: 'hold-hash',
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
        physical: { create: { stage: 'PENDING' } },
      },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })

    await expect(studio.hold(other.id, order.id, 'Thiếu giấy')).rejects.toBeInstanceOf(NotFoundException)
    await studio.hold(staff.id, order.id, 'Thiếu giấy mẫu thử')
    await expect(studio.failQuality(staff.id, order.id, 'Lỗi màu')).rejects.toBeInstanceOf(ConflictException)
    await expect(studio.recordShipment(staff.id, order.id, 'Sai địa chỉ')).rejects.toBeInstanceOf(NotFoundException)

    const detail = await reader.detail(owner.id, order.id)
    expect(detail.physicalOnHold).toBe(true)
    expect(detail.holdReason).toBe('Thiếu giấy mẫu thử')
    expect(JSON.stringify(detail)).not.toContain(staff.id)
    expect(JSON.stringify(detail)).not.toContain('Hold secret')
    expect((await notices.list(owner.id)).map((item) => item.plainText)).toContain('Đơn giấy đang tạm dừng.')
  })
})
