import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { calendarForPublishedEvent } from './invitation-calendar.js'
import { InvitationService } from './invitation.service.js'
import { SuspendInvitationService } from './suspend-invitation.service.js'

const ownerEmail = `suspend-owner-${Date.now()}@example.com`
const adminEmail = `suspend-admin-${Date.now()}@example.com`
const staffEmail = `suspend-staff-${Date.now()}@example.com`

describe('SuspendInvitationService', () => {
  const invitations = new InvitationService()
  const suspend = new SuspendInvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, adminEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('hides a suspended invitation and keeps the suspension through publish', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const admin = await prisma.user.create({
      data: { normalizedEmail: adminEmail, displayName: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await invitations.createProject(owner.id, 'Suspended')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Tiệc',
        eventLocalStart: '20270601T180000',
        timeZone: 'Asia/Ho_Chi_Minh',
      },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const page = await invitations.readPublished(handle.slug)
    expect('eventTitle' in page && page.eventTitle).toBe('Tiệc')

    await expect(suspend.suspend(staff.id, created.id)).rejects.toBeInstanceOf(NotFoundException)
    await suspend.suspend(admin.id, created.id)
    const stored = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    expect(stored.status).toBe('PUBLISHED')
    expect(stored.moderationState).toBe('SUSPENDED')
    await expect(invitations.readPublished(handle.slug)).rejects.toBeInstanceOf(NotFoundException)
    await expect(calendarForPublishedEvent(handle.slug)).rejects.toBeInstanceOf(NotFoundException)

    const next = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: saved.version + 1,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Tiệc tối',
        eventLocalStart: '20270601T180000',
        timeZone: 'Asia/Ho_Chi_Minh',
      },
    })
    await expect(invitations.publish(owner.id, created.id, next.version)).rejects.toBeInstanceOf(ConflictException)
    const after = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    expect(after.moderationState).toBe('SUSPENDED')
    expect(after.status).toBe('PUBLISHED')
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(1)
  })
})