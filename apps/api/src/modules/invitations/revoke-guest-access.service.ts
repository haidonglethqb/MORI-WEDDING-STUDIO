import { createHash } from 'node:crypto'
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { versionConflict } from './invitation-version.js'

const REVOKE_GUEST_ACCESS = 'revoke-guest-access'

@Injectable()
export class RevokeGuestAccessService {
  async revokeAll(input: {
    ownerUserId: string
    invitationId: string
    expectedVersion: number
    idempotencyKey: string
    confirm: boolean
  }): Promise<{ accessEpoch: number; version: number }> {
    if (!input.confirm) {
      throw new ConflictException('Confirm that existing guest links must be reissued')
    }
    const requestHash = createHash('sha256')
      .update(JSON.stringify({
        confirm: input.confirm,
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
            command: REVOKE_GUEST_ACCESS,
            key: input.idempotencyKey,
          },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) return { accessEpoch: invitation.accessEpoch, version: invitation.draftVersion }
      if (invitation.draftVersion !== input.expectedVersion) throw versionConflict()
      const updated = await tx.invitation.update({
        where: { id: invitation.id },
        data: { accessEpoch: { increment: 1 }, draftVersion: { increment: 1 } },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.ownerUserId,
          command: REVOKE_GUEST_ACCESS,
          key: input.idempotencyKey,
          requestHash,
          resourceId: invitation.id,
        },
      })
      return { accessEpoch: updated.accessEpoch, version: updated.draftVersion }
    })
  }
}
