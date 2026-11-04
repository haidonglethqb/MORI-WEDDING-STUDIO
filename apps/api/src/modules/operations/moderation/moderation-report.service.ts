import { createHash } from 'node:crypto'
import { HttpException, HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { markExpiredIfDue } from '../../invitations/invitation-expiry.js'
import { livePublicInvitation } from '../../invitations/live-public-invitation.js'

const MAX_HOURLY_REPORTS = 3
const HOUR_MS = 60 * 60 * 1000

@Injectable()
export class ModerationReportService {
  async submit(slug: string, reporterKey: string, rawReason: string): Promise<{ accepted: true }> {
    const reason = rawReason.trim()
    if (reason.length < 3 || reason.length > 500) {
      throw new UnprocessableEntityException('Report reason must be between 3 and 500 characters')
    }
    const prisma = getPrismaClient()
    const handle = await prisma.invitationHandle.findFirst({
      where: { slug, revokedAt: null, invitation: livePublicInvitation },
      include: { invitation: true },
    })
    if (!handle || (await markExpiredIfDue(handle.invitation.id))) {
      throw new NotFoundException()
    }
    const reporterDigest = createHash('sha256')
      .update(reporterKey.trim() || 'anonymous')
      .digest('hex')
    const since = new Date(Date.now() - HOUR_MS)
    const recent = await prisma.moderationReport.count({
      where: {
        reporterDigest,
        createdAt: { gte: since },
      },
    })
    if (recent >= MAX_HOURLY_REPORTS) {
      throw new HttpException('Too many reports submitted recently', HttpStatus.TOO_MANY_REQUESTS)
    }
    await prisma.moderationReport.create({
      data: {
        invitationId: handle.invitation.id,
        reporterDigest,
        reason,
      },
    })
    return { accepted: true }
  }
}
