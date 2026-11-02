import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `party-switch-${Date.now()}@example.com`

describe('same-wedding party switch', () => {
  const invitations = new InvitationService()
  const links = new GuestLinkService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('requires confirmation and keeps each party response separate', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Switch')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const lan = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const hoa = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Hoa' },
    })
    const handle = await prisma.invitationHandle.findFirstOrThrow({
      where: { invitationId: created.id, revokedAt: null },
    })
    const lanSecret = await links.issue(owner.id, created.id, lan.id)
    const hoaSecret = await links.issue(owner.id, created.id, hoa.id)
    const lanSession = await links.exchange(handle.slug, lanSecret)
    await rsvp.submit({
      partyId: lan.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 2,
    })

    await expect(links.exchange(handle.slug, hoaSecret, {
      currentSessionToken: lanSession.sessionToken,
      confirmSwitch: false,
    })).rejects.toBeInstanceOf(ConflictException)
    expect(await prisma.guestGrant.count({ where: { partyId: hoa.id, kind: 'SESSION' } })).toBe(0)
    expect((await links.readSession(handle.slug, lanSession.sessionToken)).partyName).toBe('Lan')

    const hoaSession = await links.exchange(handle.slug, hoaSecret, {
      currentSessionToken: lanSession.sessionToken,
      confirmSwitch: true,
    })
    expect(hoaSession.partyName).toBe('Hoa')
    expect((await links.readSession(handle.slug, lanSession.sessionToken)).partyName).toBe('Lan')
    const lanAnswer = await prisma.rsvpEventAnswer.findFirstOrThrow({
      where: { eventId: event.id, response: { partyId: lan.id } },
    })
    expect(lanAnswer.attendeeCount).toBe(2)
    expect(await prisma.rsvpResponse.count({ where: { partyId: hoa.id } })).toBe(0)
  })
})