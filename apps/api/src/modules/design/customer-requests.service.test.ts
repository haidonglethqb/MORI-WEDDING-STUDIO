import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { CustomerRequestsService } from './customer-requests.service.js'
import { RequestMessagesService } from './request-messages.service.js'

const ownerEmail = `customer-req-${Date.now()}@example.com`
const otherEmail = `customer-other-${Date.now()}@example.com`

describe('customer request thread', () => {
  const requests = new CustomerRequestsService(new RequestMessagesService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('shows the owner their requests and hides internal notes', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Không hiện cho khách' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: owner.id,
        visibility: 'INTERNAL',
        plainText: 'Ghi chú nội bộ',
      },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: owner.id,
        visibility: 'CUSTOMER',
        plainText: 'Mình muốn giấy ngà',
      },
    })

    const list = await requests.list(owner.id)
    expect(list).toEqual([{ requestId: request.id, kind: 'PAPER', status: 'APPROVED' }])
    expect(JSON.stringify(list)).not.toContain('Không hiện cho khách')
    expect(await requests.list(other.id)).toEqual([])

    const thread = await requests.thread(owner.id, request.id)
    expect(thread.map((row) => row.plainText)).toEqual(['Mình muốn giấy ngà'])
    await expect(requests.thread(other.id, request.id)).rejects.toBeInstanceOf(NotFoundException)

    const started = await requests.start(owner.id, 'DIGITAL', 'design-once')
    const again = await requests.start(owner.id, 'DIGITAL', 'design-once')
    expect(again.requestId).toBe(started.requestId)
    expect(started.kind).toBe('DIGITAL')
    expect(JSON.stringify(await requests.list(owner.id))).not.toContain('Yêu cầu của khách')
    expect(await requests.list(other.id)).toEqual([])
    await expect(requests.start(owner.id, 'TRIFOLD', 'design-bad')).rejects.toThrow(/supported kind/)
  })
})