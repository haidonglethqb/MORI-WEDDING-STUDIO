import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationListService } from './invitation-list.service.js'
import { InvitationService } from './invitation.service.js'

const ownerEmail = `list-owner-${Date.now()}@example.com`
const otherEmail = `list-other-${Date.now()}@example.com`

describe('invitation list', () => {
  const list = new InvitationListService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('returns only the signed-in customer invitations', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Private title' },
    })
    const created = await new InvitationService().createInvitation(owner.id, project.id)

    const mine = await list.forOwner(owner.id)
    expect(mine).toHaveLength(1)
    expect(mine[0]).toMatchObject({
      invitationId: created.id,
      status: 'DRAFT',
      eventTitle: 'Lễ cưới',
      displayNames: ['Tên một', 'Tên hai'],
    })
    expect(mine[0]?.slug).toMatch(/^invite-/)
    expect(JSON.stringify(mine)).not.toContain('Private title')
    expect(await list.forOwner(other.id)).toEqual([])

    const started = await list.start(owner.id, 'create-once')
    const again = await list.start(owner.id, 'create-once')
    expect(again.invitationId).toBe(started.invitationId)
    expect(await prisma.invitation.count({ where: { project: { ownerUserId: owner.id } } })).toBe(2)
    expect(JSON.stringify(started)).not.toContain('Thiệp của khách')
  })
})