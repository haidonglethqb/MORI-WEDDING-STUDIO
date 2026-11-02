import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { RsvpService, type RsvpCommand } from './rsvp.service.js'

@Injectable()
export class GuestRsvpService {
  constructor(
    private readonly links: GuestLinkService,
    private readonly rsvp: RsvpService,
  ) {}

  async submit(slug: string, sessionToken: string, command: RsvpCommand): Promise<{ version: number }> {
    const partyId = await this.links.sessionPartyId(slug, sessionToken)
    if (partyId !== command.partyId) throw new NotFoundException()
    return this.rsvp.submit(command)
  }

  async answer(
    slug: string,
    sessionToken: string,
    input: Omit<RsvpCommand, 'partyId'>,
  ): Promise<{ version: number }> {
    const partyId = await this.links.sessionPartyId(slug, sessionToken)
    return this.rsvp.submit({ ...input, partyId })
  }

  async sheet(slug: string, sessionToken: string): Promise<{ version: number; events: { eventId: string; title: string }[] }> {
    const partyId = await this.links.sessionPartyId(slug, sessionToken)
    const prisma = getPrismaClient()
    const party = await prisma.guestParty.findUnique({
      where: { id: partyId },
      include: { allowances: true },
    })
    if (!party) throw new NotFoundException()
    const events = await prisma.invitationEvent.findMany({
      where: { invitationId: party.invitationId, retiredAt: null },
      orderBy: { title: 'asc' },
    })
    const visible =
      party.source === 'ROSTER' ? events.filter((event) => party.allowances.some((row) => row.eventId === event.id)) : events
    const response = await prisma.rsvpResponse.findUnique({ where: { partyId } })
    return {
      version: response?.version ?? 0,
      events: visible.map((event) => ({ eventId: event.id, title: event.title })),
    }
  }
}
