import { afterAll, describe, expect, it } from 'vitest'
import { ConflictException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from './invitation.service.js'

const email = `quota-${Date.now()}@example.com`
const content = {
  schemaVersion: 1 as const,
  displayNames: ['Mai', 'An'] as [string, string],
  eventTitle: 'Lễ cưới',
}

describe('invitation quota', () => {
  const invitations = new InvitationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('publishes only one invitation when two publishes race', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner', invitationQuota: 1 },
    })
    const project = await invitations.createProject(owner.id, 'Quota')
    const first = await invitations.createInvitation(owner.id, project.id)
    const second = await invitations.createInvitation(owner.id, project.id)
    const savedFirst = await invitations.saveDraft(owner.id, first.id, { expectedVersion: 0, content })
    const savedSecond = await invitations.saveDraft(owner.id, second.id, { expectedVersion: 0, content })

    const results = await Promise.allSettled([
      invitations.publish(owner.id, first.id, savedFirst.version),
      invitations.publish(owner.id, second.id, savedSecond.version),
    ])
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter((result) => result.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException)
    expect(await prisma.invitation.count({ where: { projectId: project.id, status: 'PUBLISHED' } })).toBe(1)
  })
})