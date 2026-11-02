import { afterAll, describe, expect, it } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from '../modules/invitations/invitation.service.js'
import { RsvpService } from '../modules/invitations/rsvp.service.js'
import { assertMutationOrigin } from './origin-guard.js'

const email = `origin-${Date.now()}@example.com`
const rsvpEmail = `origin-rsvp-${Date.now()}@example.com`

describe('mutation origin', () => {
  const invitations = new InvitationService()
  const rsvp = new RsvpService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [email, rsvpEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('refuses a foreign origin before publish and allows the studio origin', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Origin')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })

    await expect(run('https://evil.example', () => invitations.publish(owner.id, created.id, saved.version)))
      .rejects.toBeInstanceOf(ForbiddenException)
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('DRAFT')
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(0)

    await run('http://app.mori.localhost', () => invitations.publish(owner.id, created.id, saved.version))
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('PUBLISHED')
  })

  it('refuses a foreign origin before an RSVP and allows the invite origin', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: rsvpEmail, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'RSVP origin')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await run('http://app.mori.localhost', () => invitations.publish(owner.id, created.id, saved.version))
    const event = await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })
    const party = await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'OPEN', displayName: 'Lan' },
    })
    const command = {
      partyId: party.id,
      eventId: event.id,
      expectedVersion: 0,
      status: 'ATTENDING' as const,
      attendeeCount: 2,
    }

    await expect(run('https://evil.example', () => rsvp.submit(command))).rejects.toBeInstanceOf(
      ForbiddenException,
    )
    expect(await prisma.rsvpResponse.count({ where: { partyId: party.id } })).toBe(0)

    const accepted = await run('http://invite.mori.localhost', () => rsvp.submit(command))
    expect(accepted.version).toBe(1)
    const answer = await prisma.rsvpEventAnswer.findFirstOrThrow({ where: { eventId: event.id } })
    expect(answer.attendeeCount).toBe(2)
    expect(answer.status).toBe('ATTENDING')
  })
})

async function run<T>(origin: string | undefined, action: () => Promise<T>): Promise<T> {
  assertMutationOrigin(origin)
  return action()
}
