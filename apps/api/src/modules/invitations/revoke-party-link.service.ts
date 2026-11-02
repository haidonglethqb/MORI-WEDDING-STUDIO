import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class RevokePartyLinkService {
  async revoke(ownerUserId: string, partyId: string, invitationId?: string): Promise<{ linkVersion: number }> {
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const party = await tx.guestParty.findFirst({
        where: {
          id: partyId,
          ...(invitationId ? { invitationId } : {}),
          invitation: { project: { ownerUserId } },
        },
      })
      if (!party) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${party.invitationId}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM guest_parties WHERE id = ${party.id}::uuid FOR UPDATE`
      const updated = await tx.guestParty.update({
        where: { id: party.id },
        data: { linkVersion: { increment: 1 } },
      })
      return { linkVersion: updated.linkVersion }
    })
  }
}
