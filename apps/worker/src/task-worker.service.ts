import { Injectable, Logger } from '@nestjs/common'
import { getPrismaClient, claimNotificationTasks } from '@mori/database'

@Injectable()
export class TaskWorkerService {
  private readonly logger = new Logger(TaskWorkerService.name)

  async processTasks(): Promise<void> {
    try {
      const notices = await claimNotificationTasks()
      if (notices > 0) {
        this.logger.log(`Processed ${notices} notification task(s)`)
      }
    } catch (err) {
      this.logger.error('Failed processing notification tasks:', err)
    }

    try {
      await this.sweepExpiredInvitations()
      await this.sweepExpiredUploadSessions()
      await this.sweepExpiredAuthTokens()
    } catch (err) {
      this.logger.error('Failed running background sweeps:', err)
    }
  }

  private async sweepExpiredInvitations(): Promise<number> {
    const prisma = getPrismaClient()
    const updated = await prisma.$executeRaw`
      UPDATE invitations
      SET status = 'EXPIRED'
      WHERE status = 'PUBLISHED'
        AND "expiresAt" IS NOT NULL
        AND "expiresAt" <= NOW()
    `
    if (updated > 0) {
      this.logger.log(`Expired ${updated} invitation(s) past expiration deadline`)
    }
    return updated
  }

  private async sweepExpiredUploadSessions(): Promise<number> {
    const prisma = getPrismaClient()
    const deleted = await prisma.$executeRaw`
      DELETE FROM media_upload_sessions
      WHERE "completedAt" IS NULL
        AND "expiresAt" <= NOW()
    `
    if (deleted > 0) {
      this.logger.log(`Cleaned up ${deleted} abandoned media upload session(s)`)
    }
    return deleted
  }

  private async sweepExpiredAuthTokens(): Promise<number> {
    const prisma = getPrismaClient()
    const deleted = await prisma.$executeRaw`
      DELETE FROM auth_tokens
      WHERE "expiresAt" <= NOW()
    `
    if (deleted > 0) {
      this.logger.log(`Cleaned up ${deleted} expired auth token(s)`)
    }
    return deleted
  }
}
