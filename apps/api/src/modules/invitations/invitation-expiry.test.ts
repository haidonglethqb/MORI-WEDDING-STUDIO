import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { calendarForPublishedEvent } from './invitation-calendar.js'
import { InvitationService } from './invitation.service.js'

const email = `expiry-${Date.now()}@example.com`
const content = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Tiệc',
  eventLocalStart: '20270601T180000',
  timeZone: 'Asia/Ho_Chi_Minh',
}

describe('invitation expiry', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('expires a published invitation on the database clock and blocks republish', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Expiry')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, { expectedVersion: 0, content })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const page = await invitations.readPublished(handle.slug)
    expect('eventTitle' in page && page.eventTitle).toBe('Tiệc')

    await prisma.$executeRaw`
      UPDATE invitations
      SET "expiresAt" = NOW() - interval '1 second'
      WHERE id = ${created.id}::uuid
    `
    await expect(invitations.readPublished(handle.slug)).rejects.toBeInstanceOf(NotFoundException)
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('EXPIRED')
    await expect(calendarForPublishedEvent(handle.slug)).rejects.toBeInstanceOf(NotFoundException)

    const next = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: saved.version + 1,
      content: { ...content, eventTitle: 'Tiệc tối' },
    })
    await expect(invitations.publish(owner.id, created.id, next.version)).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('EXPIRED')
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(1)

    await prisma.$executeRaw`
      UPDATE invitations
      SET "expiresAt" = NOW() + interval '1 day'
      WHERE id = ${created.id}::uuid
    `
    await invitations.publish(owner.id, created.id, next.version)
    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('PUBLISHED')
    const restored = await invitations.readPublished(handle.slug)
    expect('eventTitle' in restored && restored.eventTitle).toBe('Tiệc tối')
  })
})