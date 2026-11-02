import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'

@Injectable()
export class GuestPartyService {
  constructor(private readonly links: GuestLinkService) {}

  async create(input: {
    ownerUserId: string
    invitationId: string
    displayName: string
    maxAttendees: number
    idempotencyKey: string
  }): Promise<{ partyId: string; displayName: string }> {
    const displayName = input.displayName.trim()
    const key = input.idempotencyKey.trim()
    if (displayName.length < 1 || displayName.length > 80 || !Number.isInteger(input.maxAttendees)) {
      throw new UnprocessableEntityException('A guest party needs a name and a whole-number limit')
    }
    if (input.maxAttendees < 1 || input.maxAttendees > 20 || key.length < 1 || key.length > 80) {
      throw new UnprocessableEntityException('A guest party needs a name and a whole-number limit')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id: input.invitationId, project: { ownerUserId: input.ownerUserId } },
      })
      if (!invitation) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: { principalId: input.ownerUserId, command: 'create-guest-party', key },
        },
      })
      if (replay) {
        if (replay.requestHash !== displayName) {
          throw new UnprocessableEntityException('This idempotency key was already used')
        }
        const existing = await tx.guestParty.findFirst({
          where: { id: replay.resourceId, invitationId: invitation.id },
        })
        if (existing) return { partyId: existing.id, displayName: existing.displayName }
      }
      const party = await tx.guestParty.create({
        data: { invitationId: invitation.id, source: 'ROSTER', displayName },
      })
      const events = await tx.invitationEvent.findMany({
        where: { invitationId: invitation.id, retiredAt: null },
      })
      if (events.length > 0) {
        await tx.partyEventAllowance.createMany({
          data: events.map((event) => ({
            partyId: party.id,
            eventId: event.id,
            maxAttendees: input.maxAttendees,
          })),
        })
      }
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.ownerUserId,
          command: 'create-guest-party',
          key,
          requestHash: displayName,
          resourceId: party.id,
        },
      })
      return { partyId: party.id, displayName: party.displayName }
    })
  }

  async issueLink(input: {
    ownerUserId: string
    invitationId: string
    partyId: string
    idempotencyKey: string
  }): Promise<{ issued: true; token?: string; guestPath?: string }> {
    const key = input.idempotencyKey.trim()
    if (key.length < 1 || key.length > 80) {
      throw new UnprocessableEntityException('This command needs an idempotency key')
    }
    const prisma = getPrismaClient()
    const replay = await prisma.idempotencyRecord.findUnique({
      where: {
        principalId_command_key: { principalId: input.ownerUserId, command: 'issue-guest-link', key },
      },
    })
    if (replay) {
      if (replay.requestHash !== input.partyId) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      return { issued: true }
    }
    const token = await this.links.issue(input.ownerUserId, input.invitationId, input.partyId)
    const handle = await prisma.invitationHandle.findFirst({
      where: { invitationId: input.invitationId, revokedAt: null },
    })
    await prisma.idempotencyRecord.create({
      data: {
        principalId: input.ownerUserId,
        command: 'issue-guest-link',
        key,
        requestHash: input.partyId,
        resourceId: input.partyId,
      },
    })
    return {
      issued: true,
      token,
      ...(handle ? { guestPath: `/i/${handle.slug}#guest=${token}` } : {}),
    }
  }
}
