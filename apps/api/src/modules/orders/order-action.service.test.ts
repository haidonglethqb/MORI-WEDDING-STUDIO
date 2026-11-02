import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { OrderActionService } from './order-action.service.js'
import { OrderConfirmService } from './order-confirm.service.js'
import { OrderReadService } from './order-read.service.js'

const ownerEmail = `action-owner-${Date.now()}@example.com`
const staffEmail = `action-staff-${Date.now()}@example.com`
const otherEmail = `action-other-${Date.now()}@example.com`

describe('order confirm and cancellation', () => {
  const actions = new OrderActionService(new OrderConfirmService(), new CancellationRequestService())
  const reader = new OrderReadService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('confirms once and records one cancellation request', async () => {
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
      data: { ownerUserId: owner.id, internalTitle: 'Action secret' },
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
        scopeFingerprint: 'action-hash',
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
      },
    })

    await expect(actions.confirm(owner.id, order.id, 'confirm-1')).rejects.toBeInstanceOf(NotFoundException)
    const confirmed = await actions.confirm(staff.id, order.id, 'confirm-1')
    expect(confirmed).toEqual({ status: 'CONFIRMED', totalAmountVnd: '900000' })
    expect(await actions.confirm(staff.id, order.id, 'confirm-1')).toEqual(confirmed)
    await expect(actions.confirm(staff.id, order.id, 'confirm-2')).rejects.toBeInstanceOf(ConflictException)

    const created = await actions.requestCancellation(owner.id, order.id, 'Đổi ngày', 'cancel-1')
    expect(await actions.requestCancellation(owner.id, order.id, 'Đổi ngày', 'cancel-1')).toEqual(created)
    await expect(actions.requestCancellation(other.id, order.id, 'Đổi ngày', 'cancel-2')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    const detail = await reader.detail(owner.id, order.id)
    expect(detail.status).toBe('CONFIRMED')
    expect(detail.cancellations).toEqual([{ state: 'REQUESTED', reason: 'Đổi ngày' }])
    expect(JSON.stringify(detail)).not.toContain('Action secret')
  })
})
