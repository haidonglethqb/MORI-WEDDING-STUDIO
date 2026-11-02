import { getPrismaClient } from './client.js'

export async function claimNotificationTasks(): Promise<number> {
  const prisma = getPrismaClient()
  await prisma.$executeRaw`
    UPDATE background_tasks
    SET state = 'FAILED',
        "leaseUntil" = NULL,
        "lastError" = 'Notification delivery stopped after 5 attempts'
    WHERE kind = 'deliver-notification'
      AND "attemptCount" >= 5
      AND (
        (state = 'PENDING' AND "nextRunAt" <= NOW())
        OR (state = 'RUNNING' AND "leaseUntil" IS NOT NULL AND "leaseUntil" <= NOW())
      )
  `
  const claimed = await prisma.$queryRaw<{ id: string; resourceRef: string }[]>`
    UPDATE background_tasks
    SET state = 'RUNNING',
        "attemptCount" = "attemptCount" + 1,
        "leaseUntil" = NOW() + interval '30 seconds'
    WHERE id IN (
      SELECT id
      FROM background_tasks
      WHERE kind = 'deliver-notification'
        AND "attemptCount" < 5
        AND (
          (state = 'PENDING' AND "nextRunAt" <= NOW())
          OR (state = 'RUNNING' AND "leaseUntil" IS NOT NULL AND "leaseUntil" <= NOW())
        )
      ORDER BY "createdAt"
      FOR UPDATE SKIP LOCKED
      LIMIT 20
    )
    RETURNING id, "resourceRef"
  `
  if (!process.env['SMTP_HOST']) {
    for (const task of claimed) {
      await prisma.notificationDelivery.updateMany({
        where: { notificationId: task.resourceRef, channel: 'EMAIL', state: 'PENDING' },
        data: { state: 'SKIPPED' },
      })
      await prisma.backgroundTask.update({
        where: { id: task.id },
        data: { state: 'SUCCEEDED', leaseUntil: null, lastError: null },
      })
    }
    return claimed.length
  }
  for (const task of claimed) {
    await prisma.backgroundTask.update({
      where: { id: task.id },
      data: {
        state: 'PENDING',
        leaseUntil: null,
        nextRunAt: new Date(Date.now() + 60 * 60 * 1000),
        lastError: 'Notification email waits for a mail transport',
      },
    })
  }
  return claimed.length
}
