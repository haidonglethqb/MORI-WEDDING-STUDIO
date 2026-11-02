import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProofService } from '../design/proof.service.js'
import { OrderConfirmService } from '../orders/order-confirm.service.js'
import { NotificationService } from './notification.service.js'
import { claimNotificationTasks } from '@mori/database'

const ownerEmail = `notice-owner-${Date.now()}@example.com`
const staffEmail = `notice-staff-${Date.now()}@example.com`
const otherEmail = `notice-other-${Date.now()}@example.com`

describe('customer notices', () => {
  const proofs = new ProofService()
  const confirmations = new OrderConfirmService()
  const notices = new NotificationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('tells the owner about a new proof and a confirmed order without email', async () => {
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
      data: { ownerUserId: owner.id, internalTitle: 'Notice secret' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'WORKING',
        manifestHash: 'notice-hash',
        renderState: 'READY',
        faceMapComplete: true,
        isFixture: true,
      },
    })
    await proofs.submitForReview(request.id, revision.id)
    const quote = await prisma.quote.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'ACCEPTED',
        totalAmountVnd: 900_000n,
        shippingAmountVnd: 20_000n,
        taxAmountVnd: 10_000n,
        expiresAt: new Date(Date.now() + 86_400_000),
        scopeFingerprint: 'notice-hash',
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
    await confirmations.confirm(staff.id, order.id)

    const visible = await notices.list(owner.id)
    expect(visible.map((item) => item.plainText).sort()).toEqual(['Có bản in mới để xem.', 'Xưởng đã xác nhận đơn.'])
    expect(JSON.stringify(visible)).not.toContain('Notice secret')
    expect(JSON.stringify(visible)).not.toContain(ownerEmail)
    expect(await notices.list(other.id)).toEqual([])
    await expect(notices.markRead(other.id, visible[0]?.notificationId ?? '')).rejects.toBeInstanceOf(NotFoundException)

    const proofNotice = visible.find((item) => item.eventType === 'PROOF_IN_REVIEW')
    await notices.markRead(owner.id, proofNotice?.notificationId ?? '')
    expect((await notices.list(owner.id)).find((item) => item.eventType === 'PROOF_IN_REVIEW')?.readAt).toBeTruthy()
    const delivery = await prisma.notificationDelivery.findFirst({
      where: { notification: { recipientUserId: owner.id, eventType: 'ORDER_CONFIRMED' }, channel: 'EMAIL' },
    })
    expect(delivery?.state).toBe('PENDING')
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CONFIRMED')
    const first = await claimNotificationTasks()
    expect(first).toBeGreaterThan(0)
    expect(
      (
        await prisma.notificationDelivery.findFirst({
          where: { notification: { recipientUserId: owner.id, eventType: 'ORDER_CONFIRMED' }, channel: 'EMAIL' },
        })
      )?.state,
    ).toBe('SKIPPED')
    expect(await claimNotificationTasks()).toBe(0)
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CONFIRMED')
  })
})
