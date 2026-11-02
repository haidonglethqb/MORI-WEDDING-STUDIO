import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class EventRetireService {
  async retire(ownerUserId: string, eventId: string, invitationId?: string): Promise<{ preservedAnswers: number }> {
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const event = await tx.invitationEvent.findFirst({
        where: {
          id: eventId,
          ...(invitationId ? { invitationId } : {}),
          invitation: { project: { ownerUserId } },
        },
      })
      if (!event) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${event.invitationId}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM invitation_events WHERE id = ${event.id}::uuid FOR UPDATE`
      const current = await tx.invitationEvent.findUnique({ where: { id: event.id } })
      if (!current || current.retiredAt) throw new ConflictException('This event is already retired')
      await tx.$executeRaw`
        UPDATE invitation_events SET "retiredAt" = NOW() WHERE id = ${event.id}::uuid
      `
      const preservedAnswers = await tx.rsvpEventAnswer.count({ where: { eventId: event.id } })
      return { preservedAnswers }
    })
  }
}
