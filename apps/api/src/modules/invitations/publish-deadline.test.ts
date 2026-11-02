import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'

const email = `publish-deadline-${Date.now()}@example.com`
const firstTime = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Tiệc',
  eventLocalStart: '20270615T180000',
  timeZone: 'Asia/Ho_Chi_Minh',
}

describe('publish RSVP deadline', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('blocks a schedule that starts before the RSVP deadline until RSVP is off', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Deadline publish')
    const created = await invitations.createInvitation(owner.id, project.id)
    const firstDraft = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: firstTime,
    })
    await invitations.publish(owner.id, created.id, firstDraft.version)
    await prisma.invitation.update({
      where: { id: created.id },
      data: { rsvpDeadlineAt: new Date('2027-06-20T00:00:00.000Z') },
    })
    const moved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: firstDraft.version + 1,
      content: { ...firstTime, eventLocalStart: '20270610T180000' },
    })

    await expect(invitations.publish(owner.id, created.id, moved.version)).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(1)
    expect(
      (await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })).localStart,
    ).toBe('20270615T180000')

    await prisma.invitation.update({ where: { id: created.id }, data: { rsvpMode: 'OFF' } })
    await invitations.publish(owner.id, created.id, moved.version)
    expect(
      (await prisma.invitationEvent.findFirstOrThrow({ where: { invitationId: created.id } })).localStart,
    ).toBe('20270610T180000')
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(2)
  })
})