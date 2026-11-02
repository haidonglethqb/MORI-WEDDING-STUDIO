import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class SwitchRsvpModeService {
  async toGuestList(ownerUserId: string, invitationId: string, confirmOpenGuestsLoseWrite: boolean): Promise<void> {
    if (!confirmOpenGuestsLoseWrite) {
      throw new ConflictException('Confirm that open guests will lose write permission')
    }
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id: invitationId, project: { ownerUserId } },
      })
      if (!invitation) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${invitation.id}::uuid FOR UPDATE`
      const current = await tx.invitation.findUnique({ where: { id: invitation.id } })
      if (!current || current.rsvpMode !== 'OPEN') {
        throw new ConflictException('Only an open RSVP can switch to the guest list')
      }
      await tx.invitation.update({ where: { id: current.id }, data: { rsvpMode: 'GUEST_LIST' } })
      await tx.rsvpModeAudit.create({
        data: {
          invitationId: current.id,
          ownerUserId,
          previousMode: 'OPEN',
          nextMode: 'GUEST_LIST',
        },
      })
    })
  }
}
