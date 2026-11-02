import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { GuestLinkService } from './guest-link.service.js'
import { GuestRsvpService } from './guest-rsvp.service.js'
import { InvitationService } from './invitation.service.js'
import { RsvpService } from './rsvp.service.js'

const email = `guest-rsvp-${Date.now()}@example.com`

describe('GuestRsvpService', () => {
  const invitations = new InvitationService()
  const links = new GuestLinkService()
  const guestRsvp = new GuestRsvpService(new GuestLinkService(), new RsvpService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('lets a named guest answer only for their own party', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Guest RSVP')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const lan = await prisma.guestParty.create({
      data: {
        invitationId: created.id,
        source: 'ROSTER',
        displayName: 'Lan',
        allowances: { create: { eventId: event.id, maxAttendees: 2 } },
      },
    })
    const hoa = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'ROSTER', displayName: 'Hoa' },
    })
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const opened = await links.exchange(handle.slug, await links.issue(owner.id, created.id, lan.id))

    await expect(
      guestRsvp.submit(handle.slug, opened.sessionToken, {
        partyId: hoa.id,
        eventId: event.id,
        expectedVersion: 0,
        status: 'ATTENDING',
        attendeeCount: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(await prisma.rsvpResponse.count({ where: { invitationId: created.id } })).toBe(0)

    const accepted = await guestRsvp.submit(handle.slug, opened.sessionToken, {
      partyId: lan.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING',
      attendeeCount: 1,
    })
    expect(accepted.version).toBe(1)
    expect(await prisma.rsvpResponse.count({ where: { partyId: lan.id } })).toBe(1)
    const sheet = await guestRsvp.sheet(handle.slug, opened.sessionToken)
    expect(sheet.version).toBe(1)
    expect(sheet.events).toEqual([{ eventId: event.id, title: event.title }])
    expect(JSON.stringify(sheet)).not.toContain('Hoa')
    const again = await guestRsvp.answer(handle.slug, opened.sessionToken, {
      eventId: event.id,
      expectedVersion: 1,
      status: 'DECLINED',
      attendeeCount: 0,
    })
    expect(again.version).toBe(2)
  })
})