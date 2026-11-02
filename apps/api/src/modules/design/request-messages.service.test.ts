import { afterAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { RequestMessagesService } from './request-messages.service.js'

const email = `notes-${Date.now()}@example.com`

describe('RequestMessagesService', () => {
  const messages = new RequestMessagesService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { normalizedEmail: email } })
    await disconnectPrismaClient()
  })

  it('hides staff notes from the customer list', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: email, displayName: 'Owner' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Notes' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await messages.add({
      requestId: request.id,
      authorUserId: owner.id,
      plainText: 'Can the date move to Sunday?',
      asStaff: false,
      visibility: 'INTERNAL',
    })
    await messages.add({
      requestId: request.id,
      authorUserId: owner.id,
      plainText: 'Printer is short on ivory stock.',
      asStaff: true,
      visibility: 'INTERNAL',
    })

    const visible = await messages.listForCustomer(owner.id, request.id)
    const text = visible.map((message) => message.plainText).join('\n')
    expect(text).toContain('Sunday')
    expect(text).not.toContain('ivory stock')
  })
})