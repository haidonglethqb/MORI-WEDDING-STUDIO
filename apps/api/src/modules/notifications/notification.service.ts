import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface CustomerNotice {
  notificationId: string
  eventType: string
  resourceRef: string
  plainText: string
  readAt: string | null
}

interface NoticeTx {
  notification: {
    create(args: {
      data: { recipientUserId: string; eventType: string; resourceRef: string; plainText: string }
    }): Promise<{ id: string }>
  }
  notificationDelivery: {
    create(args: {
      data: { notificationId: string; channel: string; state: string; attemptCount: number }
    }): Promise<unknown>
  }
  backgroundTask: {
    create(args: { data: { kind: string; resourceRef: string } }): Promise<unknown>
  }
}

@Injectable()
export class NotificationService {
  async list(recipientUserId: string): Promise<CustomerNotice[]> {
    const rows = await getPrismaClient().notification.findMany({
      where: { recipientUserId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => ({
      notificationId: row.id,
      eventType: row.eventType,
      resourceRef: row.resourceRef,
      plainText: row.plainText,
      readAt: row.readAt?.toISOString() ?? null,
    }))
  }

  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    const updated = await getPrismaClient().notification.updateMany({
      where: { id: notificationId, recipientUserId, readAt: null },
      data: { readAt: new Date() },
    })
    if (updated.count === 1) return
    const own = await getPrismaClient().notification.findFirst({
      where: { id: notificationId, recipientUserId },
    })
    if (!own) throw new NotFoundException()
  }
}

export async function recordNotice(
  tx: NoticeTx,
  input: { recipientUserId: string; eventType: string; resourceRef: string; plainText: string },
): Promise<void> {
  const notice = await tx.notification.create({ data: input })
  await tx.notificationDelivery.create({
    data: { notificationId: notice.id, channel: 'IN_APP', state: 'DELIVERED', attemptCount: 1 },
  })
  await tx.notificationDelivery.create({
    data: { notificationId: notice.id, channel: 'EMAIL', state: 'PENDING', attemptCount: 0 },
  })
  await tx.backgroundTask.create({
    data: { kind: 'deliver-notification', resourceRef: notice.id },
  })
}
