import { randomBytes } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import {
  InvitationContentSchema,
  type PublicInvitation,
  type SaveInvitationDraft,
} from '@mori/contracts'
import { assertInvitationQuota } from './invitation-quota.js'
import { markScheduleReconfirmation } from './mark-reconfirmation.js'
import { assertDeadlineBeforeEvent } from './rsvp-deadline-guard.js'
import { hashContent, versionConflict } from './invitation-version.js'
import { assertExpiryAllowsPublish, markExpiredIfDue } from './invitation-expiry.js'
import { livePublicInvitation } from './live-public-invitation.js'
import { toPublicInvitation } from './public-invitation.js'

const emptyContent = {
  schemaVersion: 1 as const,
  displayNames: ['Tên một', 'Tên hai'] as [string, string],
  eventTitle: 'Lễ cưới',
}

@Injectable()
export class InvitationService {
  async createProject(ownerUserId: string, internalTitle: string): Promise<{ id: string }> {
    const project = await getPrismaClient().weddingProject.create({
      data: { ownerUserId, internalTitle },
    })
    return { id: project.id }
  }

  async createInvitation(ownerUserId: string, projectId: string): Promise<{ id: string; version: number }> {
    const prisma = getPrismaClient()
    const project = await prisma.weddingProject.findFirst({
      where: { id: projectId, ownerUserId },
    })
    if (!project) throw new NotFoundException()
    const slug = `invite-${randomBytes(6).toString('base64url').toLowerCase()}`
    const invitation = await prisma.invitation.create({
      data: {
        projectId,
        draft: { create: { payload: emptyContent, schemaVersion: 1 } },
        handles: { create: { slug } },
      },
    })
    return { id: invitation.id, version: 0 }
  }

  async saveDraft(ownerUserId: string, invitationId: string, input: SaveInvitationDraft) {
    const content = InvitationContentSchema.parse(input.content)
    await this.assertCoverOwned(ownerUserId, invitationId, content.coverAssetId)
    const updated = await getPrismaClient().invitationDraft.updateMany({
      where: {
        invitationId,
        version: input.expectedVersion,
        invitation: { project: { ownerUserId } },
      },
      data: {
        payload: content,
        version: { increment: 1 },
      },
    })
    if (updated.count !== 1) throw versionConflict()
    await getPrismaClient().invitation.updateMany({
      where: { id: invitationId, project: { ownerUserId } },
      data: { draftVersion: input.expectedVersion + 1 },
    })
    return { version: input.expectedVersion + 1 }
  }

  async publish(ownerUserId: string, invitationId: string, expectedVersion: number) {
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await assertInvitationQuota(tx, ownerUserId, invitationId)
      const invitation = await tx.invitation.findFirst({
        where: { id: invitationId, project: { ownerUserId } },
        include: { draft: true },
      })
      if (!invitation?.draft) throw new NotFoundException()
      if (invitation.moderationState === 'SUSPENDED') {
        throw new ConflictException('This invitation is suspended')
      }
      await assertExpiryAllowsPublish(tx, invitationId)
      if (invitation.draft.version !== expectedVersion) throw versionConflict()
      const content = InvitationContentSchema.parse(invitation.draft.payload)
      await assertDeadlineBeforeEvent(
        tx,
        invitationId,
        content.eventLocalStart ?? null,
        content.timeZone ?? null,
      )
      await this.assertCoverOwned(ownerUserId, invitationId, content.coverAssetId)
      const latest = await tx.invitationRevision.findFirst({
        where: { invitationId },
        orderBy: { sequence: 'desc' },
      })
      const revision = await tx.invitationRevision.create({
        data: {
          invitationId,
          sequence: (latest?.sequence ?? 0) + 1,
          schemaVersion: 1,
          payload: content,
          contentHash: hashContent(content),
        },
      })
      const moved = await tx.invitation.updateMany({
        where: { id: invitationId, draftVersion: invitation.draftVersion },
        data: {
          status: 'PUBLISHED',
          publishedRevisionId: revision.id,
          draftVersion: { increment: 1 },
        },
      })
      if (moved.count !== 1) throw versionConflict()
      const eventKey = { invitationId, stableEventKey: 'primary' }
      const currentEvent = await tx.invitationEvent.findUnique({
        where: { invitationId_stableEventKey: eventKey },
      })
      const localStart = content.eventLocalStart ?? null
      const timeZone = content.timeZone ?? null
      const scheduleChanged =
        currentEvent?.localStart !== localStart || currentEvent?.timeZone !== timeZone
      const calendarSequence = (currentEvent?.calendarSequence ?? 0) + (scheduleChanged ? 1 : 0)
      if (scheduleChanged && currentEvent) await markScheduleReconfirmation(tx, currentEvent.id)
      await tx.invitationEvent.upsert({
        where: { invitationId_stableEventKey: eventKey },
        create: {
          invitationId,
          stableEventKey: 'primary',
          title: content.eventTitle,
          localStart,
          timeZone,
          calendarSequence,
        },
        update: { title: content.eventTitle, localStart, timeZone, calendarSequence },
      })
      await tx.invitationDraft.update({
        where: { invitationId },
        data: { version: { increment: 1 } },
      })
      return { revisionId: revision.id, sequence: revision.sequence }
    })
  }

  async unpublish(ownerUserId: string, invitationId: string, expectedVersion: number): Promise<void> {
    const prisma = getPrismaClient()
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, project: { ownerUserId } },
    })
    if (!invitation) throw new NotFoundException()
    if (invitation.status !== 'PUBLISHED' || invitation.draftVersion !== expectedVersion) {
      throw versionConflict()
    }
    const updated = await prisma.invitation.updateMany({
      where: { id: invitationId, status: 'PUBLISHED', draftVersion: expectedVersion },
      data: { status: 'UNPUBLISHED', draftVersion: { increment: 1 } },
    })
    if (updated.count !== 1) throw versionConflict()
  }

  async readPublished(
    slug: string,
  ): Promise<PublicInvitation | { gated: true; slug: string }> {
    const handle = await getPrismaClient().invitationHandle.findFirst({
      where: { slug, revokedAt: null, invitation: livePublicInvitation },
      include: { invitation: { include: { publishedRevision: true } } },
    })
    const payload = handle?.invitation.publishedRevision?.payload
    if (!handle || payload == null || (await markExpiredIfDue(handle.invitation.id))) {
      throw new NotFoundException()
    }
    if (handle.invitation.accessMode === 'PASSCODE') {
      return { gated: true as const, slug }
    }
    return toPublicInvitation(slug, payload)
  }

  private async assertCoverOwned(
    ownerUserId: string,
    invitationId: string,
    coverAssetId: string | undefined,
  ): Promise<void> {
    if (!coverAssetId) return
    const invitation = await getPrismaClient().invitation.findFirst({
      where: { id: invitationId, project: { ownerUserId } },
    })
    if (!invitation) throw new NotFoundException()
    const asset = await getPrismaClient().mediaAsset.findFirst({
      where: {
        id: coverAssetId,
        ownerUserId,
        projectId: invitation.projectId,
        state: 'READY',
      },
    })
    if (!asset) throw new NotFoundException()
  }
}
