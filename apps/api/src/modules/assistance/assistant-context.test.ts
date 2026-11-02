import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationService } from '../invitations/invitation.service.js'
import { AssistantContextService } from './assistant-context.js'

const slug = `ai-ctx-${Date.now()}`
const email = `ai-ctx-${Date.now()}@example.com`
const guestName = `GuestLan${Date.now()}`
const internalNote = `ivory-stock-note-${Date.now()}`

describe('AssistantContextService', () => {
  const invitations = new InvitationService()
  const context = new AssistantContextService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.product.deleteMany({ where: { slug: { startsWith: slug } } })
    await prisma.user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('sends fixture catalogue names and leaves private records out', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await invitations.createProject(owner.id, 'Assistant context')
    const created = await invitations.createInvitation(owner.id, project.id)
    await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Tiệc' },
    })
    await invitations.publish(owner.id, created.id, 1)
    await prisma.guestParty.create({
      data: { invitationId: created.id, source: 'ROSTER', displayName: guestName },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: owner.id,
        visibility: 'INTERNAL',
        plainText: internalNote,
      },
    })
    await prisma.product.create({
      data: {
        slug,
        name: 'Fixture ivory card',
        type: 'PAPER',
        description: 'Fixture',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['minimalist'],
        colourTags: [],
      },
    })

    const built = await context.build(slug)
    const text = JSON.stringify(built)
    expect(built.provider).toBe('DISABLED')
    expect(built.products).toEqual([{ name: 'Fixture ivory card', slug, isFixture: true }])
    expect(text.includes(guestName)).toBe(false)
    expect(text.includes(internalNote)).toBe(false)
    expect(text.includes(email)).toBe(false)
  })
})