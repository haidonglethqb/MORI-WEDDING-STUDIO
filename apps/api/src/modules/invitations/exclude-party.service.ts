import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class ExcludePartyService {
  async exclude(ownerUserId: string, partyId: string, reason: string, invitationId?: string): Promise<void> {
    const trimmed = reason.trim()
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new ConflictException('Excluding a guest needs a reason')
    }
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const party = await tx.guestParty.findFirst({
        where: {
          id: partyId,
          ...(invitationId ? { invitationId } : {}),
          invitation: { project: { ownerUserId } },
        },
      })
      if (!party) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${party.invitationId}::uuid FOR UPDATE`
      await tx.$queryRaw`
        SELECT id FROM invitation_events
        WHERE "invitationId" = ${party.invitationId}::uuid
        ORDER BY id
        FOR UPDATE
      `
      await tx.$queryRaw`SELECT id FROM guest_parties WHERE id = ${party.id}::uuid FOR UPDATE`
      const current = await tx.guestParty.findUnique({ where: { id: party.id } })
      if (!current || current.excludedAt) throw new ConflictException('This guest is already excluded')
      await tx.$executeRaw`
        UPDATE guest_parties
        SET "excludedAt" = NOW(), "exclusionReason" = ${trimmed}
        WHERE id = ${party.id}::uuid
      `
    })
  }
}
