import { afterAll, describe, expect, it } from 'vitest'
import { ForbiddenException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from '../invitations/invitation.service.js'
import { AiToolBoundary } from './ai-tool-boundary.js'

const email = `ai-boundary-${Date.now()}@example.com`

describe('AiToolBoundary', () => {
  const invitations = new InvitationService()
  const tools = new AiToolBoundary()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('refuses mutations and leaves invitations and orders unchanged', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'AI boundary')
    const created = await invitations.createInvitation(owner.id, project.id)
    const ordersBefore = await prisma.order.count()
    const revisionsBefore = await prisma.invitationRevision.count({ where: { invitationId: created.id } })

    for (const tool of ['publish-invitation', 'approve-proof', 'issue-quote', 'place-order', 'set-price']) {
      expect(() => tools.run(tool)).toThrow(ForbiddenException)
    }
    try {
      tools.run('place-order')
    } catch (error) {
      expect((error as ForbiddenException).getResponse()).toMatchObject({ code: 'AI_TOOL_DENIED' })
    }

    expect((await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('DRAFT')
    expect(await prisma.invitationRevision.count({ where: { invitationId: created.id } })).toBe(revisionsBefore)
    expect(await prisma.order.count()).toBe(ordersBefore)
    expect(tools.run('read-catalogue')).toEqual({
      allowed: true,
      provider: 'DISABLED',
      tool: 'read-catalogue',
    })
  })
})