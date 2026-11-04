import { createHash } from 'node:crypto'
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const MODERATE_INVITATION = 'admin-moderate-invitation'

export interface ModerationQueueItem {
  invitationId: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'EXPIRED'
  moderationState: 'ACTIVE' | 'SUSPENDED'
  moderationReason: string | null
  moderationVersion: number
  openReportCount: number
  reports: { id: string; reason: string; state: 'OPEN' | 'REVIEWED'; createdAt: string }[]
  decisions: { id: string; action: 'SUSPEND' | 'RESTORE'; reason: string; createdAt: string }[]
}

@Injectable()
export class ModerationService {
  async listQueue(adminUserId: string): Promise<ModerationQueueItem[]> {
    const prisma = getPrismaClient()
    await assertActiveAdmin(adminUserId)
    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { moderationState: 'SUSPENDED' },
          { moderationReports: { some: {} } },
          { moderationDecisions: { some: {} } },
        ],
      },
      include: {
        handles: { where: { revokedAt: null }, take: 1 },
        moderationReports: { orderBy: { createdAt: 'desc' }, take: 20 },
        moderationDecisions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
      orderBy: { id: 'asc' },
    })
    return invitations.map((inv) => ({
      invitationId: inv.id,
      slug: inv.handles[0]?.slug ?? '',
      status: inv.status,
      moderationState: inv.moderationState,
      moderationReason: inv.moderationReason,
      moderationVersion: inv.moderationVersion,
      openReportCount: inv.moderationReports.filter((r) => r.state === 'OPEN').length,
      reports: inv.moderationReports.map((r) => ({
        id: r.id,
        reason: r.reason,
        state: r.state,
        createdAt: r.createdAt.toISOString(),
      })),
      decisions: inv.moderationDecisions.map((d) => ({
        id: d.id,
        action: d.action,
        reason: d.reason,
        createdAt: d.createdAt.toISOString(),
      })),
    }))
  }

  async moderate(input: {
    adminUserId: string
    invitationId: string
    action: 'SUSPEND' | 'RESTORE'
    reason: string
    expectedVersion: number
    idempotencyKey: string
  }): Promise<{ moderationState: 'ACTIVE' | 'SUSPENDED'; status: string; version: number }> {
    const reason = input.reason.trim()
    const key = input.idempotencyKey.trim()
    if (reason.length < 3 || reason.length > 500 || key.length < 1 || key.length > 80) {
      throw new UnprocessableEntityException('Moderation requires a reason and an idempotency key')
    }
    await assertActiveAdmin(input.adminUserId)
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          action: input.action,
          expectedVersion: input.expectedVersion,
          invitationId: input.invitationId,
          reason,
        }),
      )
      .digest('hex')
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${input.invitationId}::uuid FOR UPDATE`
      const invitation = await tx.invitation.findUnique({ where: { id: input.invitationId } })
      if (!invitation) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: {
            principalId: input.adminUserId,
            command: MODERATE_INVITATION,
            key,
          },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) {
        return {
          moderationState: invitation.moderationState,
          status: invitation.status,
          version: invitation.moderationVersion,
        }
      }
      if (invitation.moderationVersion !== input.expectedVersion) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'Moderation state has changed',
        })
      }
      const nextState = input.action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE'
      const updated = await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          moderationState: nextState,
          moderationReason: input.action === 'SUSPEND' ? reason : null,
          moderationVersion: { increment: 1 },
        },
      })
      await tx.moderationReport.updateMany({
        where: { invitationId: invitation.id, state: 'OPEN' },
        data: { state: 'REVIEWED', reviewedAt: new Date(), reviewedByUserId: input.adminUserId },
      })
      await tx.moderationDecision.create({
        data: {
          invitationId: invitation.id,
          adminUserId: input.adminUserId,
          action: input.action,
          previousState: invitation.moderationState,
          nextState,
          reason,
        },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.adminUserId,
          command: MODERATE_INVITATION,
          key,
          requestHash,
          resourceId: invitation.id,
        },
      })
      return {
        moderationState: updated.moderationState,
        status: updated.status,
        version: updated.moderationVersion,
      }
    })
  }
}

async function assertActiveAdmin(userId: string): Promise<void> {
  const admin = await getPrismaClient().user.findFirst({
    where: { id: userId, role: 'ADMIN', status: 'ACTIVE' },
  })
  if (!admin) throw new NotFoundException()
}
