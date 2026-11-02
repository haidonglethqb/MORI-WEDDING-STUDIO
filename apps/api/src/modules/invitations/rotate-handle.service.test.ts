import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { RotateHandleService } from './rotate-handle.service.js'

const email = `rotate-${Date.now()}@example.com`

describe('RotateHandleService', () => {
  const invitations = new InvitationService()
  const handles = new RotateHandleService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('serves the new handle and leaves the old handle unavailable', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Rotate')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, saved.version)
    const previous = await prisma.invitationHandle.findFirstOrThrow({
      where: { invitationId: created.id, revokedAt: null },
    })
    const published = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    const page = await invitations.readPublished(previous.slug)
    expect('eventTitle' in page && page.eventTitle).toBe('Tiệc')

    const rotated = await handles.rotate({
      ownerUserId: owner.id,
      invitationId: created.id,
      expectedVersion: published.draftVersion,
      idempotencyKey: 'rotate-once',
    })
    const replay = await handles.rotate({
      ownerUserId: owner.id,
      invitationId: created.id,
      expectedVersion: published.draftVersion,
      idempotencyKey: 'rotate-once',
    })
    expect(replay.slug).toBe(rotated.slug)
    expect(rotated.slug).not.toBe(previous.slug)
    await expect(invitations.readPublished(previous.slug)).rejects.toBeInstanceOf(NotFoundException)
    const live = await invitations.readPublished(rotated.slug)
    expect('eventTitle' in live && live.eventTitle).toBe('Tiệc')
    expect(await prisma.invitationHandle.count({
      where: { invitationId: created.id, revokedAt: null },
    })).toBe(1)
    expect((await prisma.invitationHandle.findUniqueOrThrow({ where: { id: previous.id } })).revokedAt).toBeTruthy()
  })
})