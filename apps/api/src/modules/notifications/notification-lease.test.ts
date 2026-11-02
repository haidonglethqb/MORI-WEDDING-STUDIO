import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient, claimNotificationTasks } from '@mori/database'

const ownerEmail = `lease-owner-${Date.now()}@example.com`

describe('expired notification leases', () => {
  const expiredId = crypto.randomUUID()
  const heldId = crypto.randomUUID()
  const exhaustedId = crypto.randomUUID()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.backgroundTask.deleteMany({ where: { id: { in: [expiredId, heldId, exhaustedId] } } })
    await prisma.user.deleteMany({ where: { normalizedEmail: ownerEmail } })
    await disconnectPrismaClient()
  })

  it('reclaims an expired running task and leaves a live lease alone', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const notice = await prisma.notification.create({
      data: {
        recipientUserId: owner.id,
        eventType: 'ORDER_CONFIRMED',
        resourceRef: 'lease-order',
        plainText: 'Xưởng đã xác nhận đơn.',
        deliveries: { create: { channel: 'EMAIL', state: 'PENDING', attemptCount: 0 } },
      },
    })
    await prisma.backgroundTask.create({
      data: {
        id: expiredId,
        kind: 'deliver-notification',
        resourceRef: notice.id,
        state: 'RUNNING',
        attemptCount: 1,
        leaseUntil: new Date(Date.now() - 60_000),
      },
    })
    await prisma.backgroundTask.create({
      data: {
        id: heldId,
        kind: 'deliver-notification',
        resourceRef: notice.id,
        state: 'RUNNING',
        attemptCount: 1,
        leaseUntil: new Date(Date.now() + 60 * 60 * 1000),
      },
    })
    await prisma.backgroundTask.create({
      data: {
        id: exhaustedId,
        kind: 'deliver-notification',
        resourceRef: notice.id,
        state: 'RUNNING',
        attemptCount: 5,
        leaseUntil: new Date(Date.now() - 60_000),
      },
    })

    await claimNotificationTasks()

    const expired = await prisma.backgroundTask.findUniqueOrThrow({ where: { id: expiredId } })
    const held = await prisma.backgroundTask.findUniqueOrThrow({ where: { id: heldId } })
    const exhausted = await prisma.backgroundTask.findUniqueOrThrow({ where: { id: exhaustedId } })
    expect(expired.state).toBe('SUCCEEDED')
    expect(expired.attemptCount).toBe(2)
    expect(held.state).toBe('RUNNING')
    expect(held.attemptCount).toBe(1)
    expect(exhausted.state).toBe('FAILED')
    expect(exhausted.lastError).toBe('Notification delivery stopped after 5 attempts')
    expect(
      (await prisma.notificationDelivery.findFirstOrThrow({ where: { notificationId: notice.id, channel: 'EMAIL' } }))
        .state,
    ).toBe('SKIPPED')
  })
})
