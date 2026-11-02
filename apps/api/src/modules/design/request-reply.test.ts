import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { RequestMessagesService } from './request-messages.service.js'

const ownerEmail = `reply-owner-${Date.now()}@example.com`
const staffEmail = `reply-staff-${Date.now()}@example.com`
const otherEmail = `reply-other-${Date.now()}@example.com`

describe('request replies', () => {
  const messages = new RequestMessagesService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lets assigned staff write an internal note the customer cannot read', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Reply' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })

    await messages.reply({
      actorUserId: owner.id,
      requestId: request.id,
      plainText: 'Đổi ngày giúp mình',
      visibility: 'INTERNAL',
      idempotencyKey: 'owner-note',
    })
    await messages.reply({
      actorUserId: staff.id,
      requestId: request.id,
      plainText: 'Giữ ghi chú máy in',
      visibility: 'INTERNAL',
      idempotencyKey: 'staff-note',
    })
    await messages.reply({
      actorUserId: staff.id,
      requestId: request.id,
      plainText: 'Giữ ghi chú máy in',
      visibility: 'INTERNAL',
      idempotencyKey: 'staff-note',
    })

    const visible = await messages.listForCustomer(owner.id, request.id)
    expect(visible.map((row) => row.plainText)).toEqual(['Đổi ngày giúp mình'])
    expect(await prisma.requestMessage.count({ where: { requestId: request.id } })).toBe(2)
    await expect(
      messages.reply({
        actorUserId: other.id,
        requestId: request.id,
        plainText: 'Không được',
        visibility: 'CUSTOMER',
        idempotencyKey: 'other-note',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})