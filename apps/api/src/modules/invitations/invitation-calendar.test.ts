import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { calendarForPublishedEvent } from './invitation-calendar.js'
import { InvitationService } from './invitation.service.js'

const email = `calendar-${Date.now()}@example.com`

describe('invitation calendar', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('keeps the uid and increments the sequence when the time changes', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Calendar')
    const created = await invitations.createInvitation(owner.id, project.id)
    const base = {
      schemaVersion: 1 as const,
      displayNames: ['Mai', 'An'] as [string, string],
      eventTitle: 'Lễ, cưới',
      eventLocalStart: '20261101T180000',
      timeZone: 'Asia/Ho_Chi_Minh',
    }
    const saved = await invitations.saveDraft(owner.id, created.id, { expectedVersion: 0, content: base })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const first = await calendarForPublishedEvent(handle.slug)
    expect(first).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261101T180000')
    expect(first).toContain('SUMMARY:Lễ\\, cưới')
    const uid = first.match(/UID:(.+)\r/)?.[1]

    const current = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    const edited = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: current.draftVersion,
      content: { ...base, eventLocalStart: '20261101T190000' },
    })
    await invitations.publish(owner.id, created.id, edited.version)
    const second = await calendarForPublishedEvent(handle.slug)
    expect(second).toContain(`UID:${uid}`)
    expect(second).toContain('SEQUENCE:2')
    expect(second).toContain('20261101T190000')
  })
})