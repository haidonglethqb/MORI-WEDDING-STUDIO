import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class SuspendInvitationService {
  async suspend(adminUserId: string, invitationId: string): Promise<void> {
    const prisma = getPrismaClient()
    const admin = await prisma.user.findFirst({
      where: { id: adminUserId, role: 'ADMIN', status: 'ACTIVE' },
    })
    if (!admin) throw new NotFoundException()
    const updated = await prisma.invitation.updateMany({
      where: { id: invitationId },
      data: { moderationState: 'SUSPENDED' },
    })
    if (updated.count !== 1) throw new NotFoundException()
  }
}
