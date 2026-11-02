import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationEditorService } from './invitation-editor.service.js'
import { InvitationService } from './invitation.service.js'

const ownerEmail = `editor-owner-${Date.now()}@example.com`
const otherEmail = `editor-other-${Date.now()}@example.com`

describe('invitation editor', () => {
  const editor = new InvitationEditorService(new InvitationService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('saves a draft and hides it from another customer', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Editor' },
    })
    const created = await new InvitationService().createInvitation(owner.id, project.id)
    const opened = await editor.read(owner.id, created.id)
    expect(opened.version).toBe(0)
    expect(opened.displayNames).toEqual(['Tên một', 'Tên hai'])
    expect(opened.slug.startsWith('invite-')).toBe(true)

    const saved = await editor.save(owner.id, created.id, {
      expectedVersion: 0,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Lễ tại nhà',
        greeting: 'Mời bạn đến chung vui',
      },
    })
    expect(saved.version).toBe(1)
    expect(saved.displayNames).toEqual(['Mai', 'An'])
    expect(saved.eventTitle).toBe('Lễ tại nhà')
    expect(saved.greeting).toBe('Mời bạn đến chung vui')
    expect((await editor.read(owner.id, created.id)).greeting).toBe('Mời bạn đến chung vui')

    await expect(editor.read(other.id, created.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      editor.save(owner.id, created.id, {
        expectedVersion: 0,
        content: {
          schemaVersion: 1,
          displayNames: ['Mai', 'An'],
          eventTitle: 'Lễ tại nhà',
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException)
    expect((await editor.read(owner.id, created.id)).version).toBe(1)

    await expect(editor.publish(other.id, created.id, 1)).rejects.toBeInstanceOf(NotFoundException)
    const published = await editor.publish(owner.id, created.id, 1)
    expect(published.published).toBe(true)
    expect(published.version).toBe(2)
    const page = await new InvitationService().readPublished(published.slug)
    expect(page).toMatchObject({
      displayNames: ['Mai', 'An'],
      eventTitle: 'Lễ tại nhà',
      greeting: 'Mời bạn đến chung vui',
    })
  })

  it('keeps a published sample on the guest path', async () => {
    const prisma = getPrismaClient()
    const invitations = new InvitationService()
    const existing = await prisma.invitationHandle.findFirst({
      where: { slug: 'fixture-invite', revokedAt: null },
    })
    if (existing) {
      const page = await invitations.readPublished('fixture-invite')
      expect(page).toMatchObject({ displayNames: ['Mai', 'An'], eventTitle: 'Lễ tại nhà' })
      return
    }
    const owner = await prisma.user.create({
      data: { normalizedEmail: 'fixture-published-invite@example.com', displayName: 'Fixture owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Fixture invitation' },
    })
    const created = await invitations.createInvitation(owner.id, project.id)
    await editor.save(owner.id, created.id, {
      expectedVersion: 0,
      content: {
        schemaVersion: 1,
        displayNames: ['Mai', 'An'],
        eventTitle: 'Lễ tại nhà',
        greeting: 'Mẫu thử',
      },
    })
    await editor.publish(owner.id, created.id, 1)
    await prisma.invitationHandle.updateMany({
      where: { invitationId: created.id, revokedAt: null },
      data: { slug: 'fixture-invite' },
    })
    const page = await invitations.readPublished('fixture-invite')
    expect(page).toMatchObject({ displayNames: ['Mai', 'An'], greeting: 'Mẫu thử' })
  })
})