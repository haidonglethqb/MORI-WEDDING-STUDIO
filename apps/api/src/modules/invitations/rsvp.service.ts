import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface RsvpCommand {
  partyId: string
  eventId: string
  expectedVersion: number
  status: 'ATTENDING' | 'DECLINED'
  attendeeCount: number
}

@Injectable()
export class RsvpService {
  async submit(command: RsvpCommand): Promise<{ version: number }> {
    if (command.status === 'ATTENDING' && command.attendeeCount < 1) {
      throw new ConflictException('Attending responses need a count of at least 1')
    }
    if (command.status === 'DECLINED' && command.attendeeCount !== 0) {
      throw new ConflictException('A declined response has no attendees')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const party = await tx.guestParty.findUnique({ where: { id: command.partyId } })
      const event = await tx.invitationEvent.findUnique({ where: { id: command.eventId } })
      if (!party || !event || party.invitationId !== event.invitationId || event.retiredAt || party.excludedAt) {
        throw new NotFoundException()
      }
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${party.invitationId}::uuid FOR UPDATE`
      const policy = await tx.$queryRaw<{ mode: string; closed: boolean }[]>`
        SELECT "rsvpMode"::text AS mode,
               ("rsvpDeadlineAt" IS NOT NULL AND "rsvpDeadlineAt" <= NOW()) AS closed
        FROM invitations
        WHERE id = ${party.invitationId}::uuid
      `
      if (policy[0]?.mode === 'OFF' || policy[0]?.closed) {
        throw new ConflictException({ code: 'RSVP_CLOSED', message: 'RSVP is closed' })
      }
      await tx.$queryRaw`SELECT id FROM invitation_events WHERE id = ${event.id}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM guest_parties WHERE id = ${party.id}::uuid FOR UPDATE`
      const lockedParty = await tx.guestParty.findUnique({ where: { id: party.id } })
      if (!lockedParty || lockedParty.excludedAt) throw new NotFoundException()
      if (policy[0]?.mode === 'GUEST_LIST' && lockedParty.source === 'OPEN') throw new NotFoundException()
      const allowance = await tx.partyEventAllowance.findUnique({
        where: { partyId_eventId: { partyId: party.id, eventId: event.id } },
      })
      if (party.source === 'ROSTER' && !allowance) throw new NotFoundException()
      if (allowance && command.status === 'ATTENDING' && command.attendeeCount > allowance.maxAttendees) {
        throw new ConflictException('That count is above the party allowance')
      }

      const existing = await tx.rsvpResponse.findUnique({
        where: { partyId: party.id },
        include: { answers: { where: { eventId: event.id } } },
      })
      const currentVersion = existing?.version ?? 0
      if (command.expectedVersion !== currentVersion) {
        throw new ConflictException('This response has changed')
      }

      const others = await tx.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(a."attendeeCount"), 0)::int AS total
        FROM rsvp_event_answers a
        JOIN rsvp_responses r ON r.id = a."responseId"
        JOIN guest_parties p ON p.id = r."partyId"
        WHERE a."eventId" = ${event.id}::uuid
          AND a.status = 'ATTENDING'
          AND p."excludedAt" IS NULL
          AND r."partyId" <> ${party.id}::uuid
      `
      const already = Number(others[0]?.total ?? 0)
      const nextCount = command.status === 'ATTENDING' ? command.attendeeCount : 0
      if (event.capacity !== null && already + nextCount > event.capacity) {
        throw new ConflictException('This event has no remaining places')
      }

      const response = existing
        ? await tx.rsvpResponse.update({
            where: { id: existing.id },
            data: { version: { increment: 1 } },
          })
        : await tx.rsvpResponse.create({
            data: { partyId: party.id, invitationId: party.invitationId, version: 1 },
          })
      await tx.rsvpEventAnswer.upsert({
        where: { responseId_eventId: { responseId: response.id, eventId: event.id } },
        create: {
          responseId: response.id,
          eventId: event.id,
          status: command.status,
          attendeeCount: nextCount,
        },
        update: { status: command.status, attendeeCount: nextCount, needsReconfirmation: false },
      })
      return { version: response.version }
    })
  }

  async read(partyId: string): Promise<{ version: number; attendeeCount: number }> {
    const response = await getPrismaClient().rsvpResponse.findUnique({
      where: { partyId },
      include: { answers: true },
    })
    if (!response) throw new NotFoundException()
    return {
      version: response.version,
      attendeeCount: response.answers.reduce((sum, answer) => sum + answer.attendeeCount, 0),
    }
  }
}
