import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'

const email = `invite-${Date.now()}@example.com`

describe('InvitationService', () => {
  const service = new InvitationService()
  let ownerId = ''
  let otherId = ''

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.user.deleteMany({ where: { normalizedEmail: { in: [email, `other-${email}`] } } })
    await disconnectPrismaClient()
  })

  it('keeps the published page stable and hides another owner', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: `other-${email}`, displayName: 'Other' },
    })
    ownerId = owner.id
    otherId = other.id

    const project = await service.createProject(ownerId, 'Mai and An')
    const created = await service.createInvitation(ownerId, project.id)
    await expect(service.createInvitation(otherId, project.id)).rejects.toBeInstanceOf(NotFoundException)

    const content = {
      schemaVersion: 1 as const,
      displayNames: ['Mai', 'An'] as [string, string],
      eventTitle: 'Lễ cưới',
    }
    const saved = await service.saveDraft(ownerId, created.id, { expectedVersion: 0, content })
    await expect(
      service.saveDraft(ownerId, created.id, { expectedVersion: 0, content }),
    ).rejects.toBeInstanceOf(ConflictException)

    const published = await service.publish(ownerId, created.id, saved.version)
    const handle = await prisma.invitationHandle.findFirstOrThrow({ where: { invitationId: created.id } })
    const live = await service.readPublished(handle.slug)
    if (!('displayNames' in live)) throw new Error('expected an open invitation')
    expect(live.displayNames).toEqual(['Mai', 'An'])
    expect(JSON.stringify(live)).not.toContain(ownerId)

    await service.saveDraft(ownerId, created.id, {
      expectedVersion: saved.version + 1,
      content: { ...content, displayNames: ['Mai', 'Bình'] },
    })
    const stillLive = await service.readPublished(handle.slug)
    if (!('displayNames' in stillLive)) throw new Error('expected an open invitation')
    expect(stillLive.displayNames).toEqual(['Mai', 'An'])
    expect(published.sequence).toBe(1)
  })
})
