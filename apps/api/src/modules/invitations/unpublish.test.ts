import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'
import { GUEST_CACHE_CONTROL } from './public-invitation.controller.js'

const email = `unpublish-${Date.now()}@example.com`
const content = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Lễ cưới',
}

describe('unpublish', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('stops serving the public page and keeps the guest cache private', async () => {
    expect(GUEST_CACHE_CONTROL).toBe('private, no-store')
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Unpublish')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, { expectedVersion: 0, content })
    await invitations.publish(owner.id, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const live = await invitations.readPublished(handle.slug)
    if (!('eventTitle' in live)) throw new Error('expected an open invitation')
    expect(live.eventTitle).toBe('Lễ cưới')

    const current = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    await invitations.unpublish(owner.id, created.id, current.draftVersion)
    await expect(invitations.readPublished(handle.slug)).rejects.toBeInstanceOf(NotFoundException)
  })
})