import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { StudioQueueService } from './studio-queue.service.js'

const staffEmail = `queue-staff-${Date.now()}@example.com`
const otherEmail = `queue-other-${Date.now()}@example.com`
const adminEmail = `queue-admin-${Date.now()}@example.com`
const customerEmail = `queue-customer-${Date.now()}@example.com`

describe('studio queue', () => {
  const queue = new StudioQueueService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [staffEmail, otherEmail, adminEmail, customerEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('shows a request only to the assigned studio account', async () => {
    const prisma = getPrismaClient()
    const customer = await prisma.user.create({
      data: { normalizedEmail: customerEmail, displayName: 'Customer', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', role: 'STUDIO', status: 'ACTIVE' },
    })
    const admin = await prisma.user.create({
      data: { normalizedEmail: adminEmail, displayName: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: customer.id, internalTitle: 'Mai và An' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: customer.id, kind: 'PAPER', isFixture: true },
    })
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorUserId: staff.id,
        visibility: 'INTERNAL',
        plainText: 'Ghi chú nội bộ không được lộ',
      },
    })
    const assignment = await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id },
    })

    const assigned = await queue.queue(staff.id)
    expect(assigned).toEqual([
      { requestId: request.id, kind: 'PAPER', status: 'APPROVED', internalTitle: 'Mai và An' },
    ])
    expect(JSON.stringify(assigned)).not.toContain('Ghi chú nội bộ')
    expect(JSON.stringify(assigned)).not.toContain(customerEmail)

    const detail = await queue.read(staff.id, request.id)
    expect(detail.messages).toEqual([{ visibility: 'INTERNAL', plainText: 'Ghi chú nội bộ không được lộ' }])
    expect(JSON.stringify(detail)).not.toContain(customerEmail)
    await expect(queue.read(other.id, request.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(queue.read(customer.id, request.id)).rejects.toBeInstanceOf(NotFoundException)

    expect(await queue.queue(other.id)).toEqual([])
    await prisma.staffAssignment.update({ where: { id: assignment.id }, data: { revokedAt: new Date() } })
    expect(await queue.queue(staff.id)).toEqual([])
    await expect(queue.read(staff.id, request.id)).rejects.toBeInstanceOf(NotFoundException)

    const adminRows = await queue.queue(admin.id)
    expect(adminRows.some((row) => row.requestId === request.id)).toBe(true)
    await expect(queue.queue(customer.id)).rejects.toBeInstanceOf(NotFoundException)
  })
})