import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class EventCapacityService {
  async setCapacity(ownerUserId: string, eventId: string, capacity: number | null): Promise<void> {
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) {
      throw new ConflictException('Capacity must be a whole number or empty')
    }
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const event = await tx.invitationEvent.findFirst({
        where: { id: eventId, invitation: { project: { ownerUserId } } },
      })
      if (!event) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${event.invitationId}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM invitation_events WHERE id = ${event.id}::uuid FOR UPDATE`
      const totals = await tx.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(a."attendeeCount"), 0)::int AS total
        FROM rsvp_event_answers a
        JOIN rsvp_responses r ON r.id = a."responseId"
        JOIN guest_parties p ON p.id = r."partyId"
        WHERE a."eventId" = ${event.id}::uuid
          AND a.status = 'ATTENDING'
          AND p."excludedAt" IS NULL
      `
      const accepted = Number(totals[0]?.total ?? 0)
      if (capacity !== null && capacity < accepted) {
        throw new ConflictException({
          code: 'EVENT_CAPACITY_EXCEEDED',
          message: 'Capacity is below the accepted attendance',
          accepted,
        })
      }
      await tx.invitationEvent.update({ where: { id: event.id }, data: { capacity } })
    })
  }
}
