import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

const LOCAL_START = /^\d{8}T\d{6}$/
const TIME_ZONE = /^[A-Za-z_]+(?:\/[A-Za-z_]+)+$/

@Injectable()
export class ReopenRsvpService {
  async reopen(ownerUserId: string, invitationId: string, deadline: Date): Promise<void> {
    const prisma = getPrismaClient()
    await prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id: invitationId, project: { ownerUserId } },
        include: { events: { where: { stableEventKey: 'primary' } } },
      })
      const event = invitation?.events[0]
      if (!invitation || !event?.localStart || !event.timeZone) throw new NotFoundException()
      if (!LOCAL_START.test(event.localStart) || !TIME_ZONE.test(event.timeZone)) {
        throw new ConflictException('The event schedule cannot be used for an RSVP deadline')
      }
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${invitation.id}::uuid FOR UPDATE`
      const closed = await tx.$queryRaw<{ closed: boolean; previous: Date | null }[]>`
        SELECT ("rsvpDeadlineAt" IS NOT NULL AND "rsvpDeadlineAt" <= NOW()) AS closed,
               "rsvpDeadlineAt" AS previous
        FROM invitations
        WHERE id = ${invitation.id}::uuid
      `
      if (!closed[0]?.closed) throw new ConflictException('RSVP is already open')
      const valid = await tx.$queryRaw<{ afterNow: boolean; beforeStart: boolean }[]>`
        SELECT ${deadline}::timestamptz > NOW() AS "afterNow",
               ${deadline}::timestamptz < (
                 to_timestamp(${event.localStart}, 'YYYYMMDD"T"HH24MISS') AT TIME ZONE ${event.timeZone}
               ) AS "beforeStart"
      `
      if (!valid[0]?.afterNow || !valid[0]?.beforeStart) {
        throw new ConflictException('The RSVP deadline must fall before the event starts')
      }
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { rsvpDeadlineAt: deadline },
      })
      await tx.rsvpPolicyAudit.create({
        data: {
          invitationId: invitation.id,
          ownerUserId,
          action: 'REOPENED',
          previousDeadline: closed[0].previous,
          nextDeadline: deadline,
        },
      })
    })
  }
}
