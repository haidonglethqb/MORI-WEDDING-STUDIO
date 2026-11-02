import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface OwnerRsvpCorrection {
  ownerUserId: string
  partyId: string
  eventId: string
  invitationId?: string
  expectedVersion: number
  status: 'ATTENDING' | 'DECLINED'
  attendeeCount: number
  reason: string
}

@Injectable()
export class OwnerRsvpService {
  async correct(command: OwnerRsvpCorrection): Promise<{ version: number }> {
    const reason = command.reason.trim()
    if (reason.length < 1 || reason.length > 500) {
      throw new ConflictException('An owner correction needs a reason')
    }
    if (command.status === 'ATTENDING' && command.attendeeCount < 1) {
      throw new ConflictException('Attending responses need a count of at least 1')
    }
    if (command.status === 'DECLINED' && command.attendeeCount !== 0) {
      throw new ConflictException('A declined response has no attendees')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const party = await tx.guestParty.findFirst({
        where: {
          id: command.partyId,
          ...(command.invitationId ? { invitationId: command.invitationId } : {}),
          invitation: { project: { ownerUserId: command.ownerUserId } },
        },
      })
      const event = await tx.invitationEvent.findUnique({ where: { id: command.eventId } })
      if (!party || !event || party.invitationId !== event.invitationId) throw new NotFoundException()
      await tx.$queryRaw`SELECT id FROM invitations WHERE id = ${party.invitationId}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM invitation_events WHERE id = ${event.id}::uuid FOR UPDATE`
      await tx.$queryRaw`SELECT id FROM guest_parties WHERE id = ${party.id}::uuid FOR UPDATE`
      const existing = await tx.rsvpResponse.findUnique({
        where: { partyId: party.id },
        include: { answers: { where: { eventId: event.id } } },
      })
      const previous = existing?.answers[0]
      if (!existing || !previous || existing.version !== command.expectedVersion) throw new NotFoundException()
      const nextCount = command.status === 'ATTENDING' ? command.attendeeCount : 0
      const response = await tx.rsvpResponse.update({
        where: { id: existing.id },
        data: { version: { increment: 1 } },
      })
      await tx.rsvpEventAnswer.update({
        where: { id: previous.id },
        data: { status: command.status, attendeeCount: nextCount, needsReconfirmation: false },
      })
      await tx.rsvpOwnerEdit.create({
        data: {
          partyId: party.id,
          eventId: event.id,
          ownerUserId: command.ownerUserId,
          reason,
          previousStatus: previous.status,
          previousCount: previous.attendeeCount,
          nextStatus: command.status,
          nextCount,
        },
      })
      return { version: response.version }
    })
  }
}
