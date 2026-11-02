import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

export interface ListedRsvp {
  partyId: string
  partyName: string
  eventId: string | null
  version: number
  status: string
  attendeeCount: number
  excluded: boolean
}

@Injectable()
export class RsvpListService {
  async list(actorUserId: string, invitationId: string): Promise<ListedRsvp[]> {
    const invitation = await getPrismaClient().invitation.findFirst({
      where: {
        id: invitationId,
        OR: [
          { project: { ownerUserId: actorUserId } },
          {
            project: {
              assignments: {
                some: { staffUserId: actorUserId, revokedAt: null, rsvpAccess: true },
              },
            },
          },
        ],
      },
      include: {
        parties: { include: { response: { include: { answers: true } } } },
      },
    })
    if (!invitation) throw new NotFoundException()
    return invitation.parties.map((party) => ({
      partyId: party.id,
      partyName: party.displayName,
      eventId: party.response?.answers[0]?.eventId ?? null,
      version: party.response?.version ?? 0,
      status: party.response?.answers[0]?.status ?? 'UNANSWERED',
      attendeeCount: party.response?.answers[0]?.attendeeCount ?? 0,
      excluded: party.excludedAt !== null,
    }))
  }
}
