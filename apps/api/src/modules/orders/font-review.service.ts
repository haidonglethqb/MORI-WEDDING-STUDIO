import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class FontReviewService {
  async accept(staffUserId: string, revisionId: string): Promise<void> {
    const prisma = getPrismaClient()
    const staff = await prisma.user.findUnique({ where: { id: staffUserId } })
    if (!staff || staff.status !== 'ACTIVE' || (staff.role !== 'STUDIO' && staff.role !== 'ADMIN')) {
      throw new NotFoundException()
    }
    const updated = await prisma.designRevision.updateMany({
      where: { id: revisionId },
      data: { fontsReady: true },
    })
    if (updated.count !== 1) throw new NotFoundException()
  }
}
