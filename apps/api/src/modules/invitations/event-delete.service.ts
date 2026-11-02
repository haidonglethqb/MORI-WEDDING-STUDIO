import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class EventDeleteService {
  async remove(ownerUserId: string, eventId: string): Promise<void> {
    const prisma = getPrismaClient()
    const event = await prisma.invitationEvent.findFirst({
      where: { id: eventId, invitation: { project: { ownerUserId } } },
    })
    if (!event) throw new NotFoundException()
    const answers = await prisma.rsvpEventAnswer.count({ where: { eventId } })
    if (answers > 0) {
      throw new ConflictException('Retire this event instead of deleting it')
    }
    await prisma.invitationEvent.delete({ where: { id: eventId } })
  }
}
