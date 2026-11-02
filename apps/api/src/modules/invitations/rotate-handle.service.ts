import { createHash, randomBytes } from 'node:crypto'
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { versionConflict } from './invitation-version.js'

const ROTATE_HANDLE = 'rotate-handle'

@Injectable()
export class RotateHandleService {
  async rotate(input: {
    ownerUserId: string
    invitationId: string
    expectedVersion: number
    idempotencyKey: string
  }): Promise<{ slug: string; version: number }> {
    const requestHash = createHash('sha256')
      .update(JSON.stringify({
        expectedVersion: input.expectedVersion,
        invitationId: input.invitationId,
      }))
      .digest('hex')
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${input.invitationId}::uuid FOR UPDATE`
      const invitation = await tx.invitation.findFirst({
        where: { id: input.invitationId, project: { ownerUserId: input.ownerUserId } },
      })
      if (!invitation) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: {
            principalId: input.ownerUserId,
            command: ROTATE_HANDLE,
            key: input.idempotencyKey,
          },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) {
        const stored = await tx.invitationHandle.findUnique({ where: { id: replay.resourceId } })
        if (stored) return { slug: stored.slug, version: invitation.draftVersion }
      }
      if (invitation.draftVersion !== input.expectedVersion) throw versionConflict()
      await tx.invitationHandle.updateMany({
        where: { invitationId: invitation.id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      const created = await tx.invitationHandle.create({
        data: {
          invitationId: invitation.id,
          slug: `invite-${randomBytes(6).toString('base64url').toLowerCase()}`,
        },
      })
      const updated = await tx.invitation.update({
        where: { id: invitation.id },
        data: { draftVersion: { increment: 1 } },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.ownerUserId,
          command: ROTATE_HANDLE,
          key: input.idempotencyKey,
          requestHash,
          resourceId: created.id,
        },
      })
      return { slug: created.slug, version: updated.draftVersion }
    })
  }
}
