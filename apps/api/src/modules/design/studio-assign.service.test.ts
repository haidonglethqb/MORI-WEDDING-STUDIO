import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { StudioAssignService } from './studio-assign.service.js'
import { StudioQueueService } from './studio-queue.service.js'

const adminEmail = `assign-admin-${Date.now()}@example.com`
const staffEmail = `assign-staff-${Date.now()}@example.com`
const customerEmail = `assign-customer-${Date.now()}@example.com`

describe('studio assignment', () => {
  const assigner = new StudioAssignService()
  const queue = new StudioQueueService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [adminEmail, staffEmail, customerEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('puts a customer request on the assigned studio queue', async () => {
    const prisma = getPrismaClient()
    const admin = await prisma.user.create({
      data: { normalizedEmail: adminEmail, displayName: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Lan', role: 'STUDIO', status: 'ACTIVE' },
    })
    const customer = await prisma.user.create({
      data: { normalizedEmail: customerEmail, displayName: 'Khách', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: customer.id, internalTitle: 'Yêu cầu của khách' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: customer.id, kind: 'PAPER', isFixture: true },
    })

    expect(await queue.queue(staff.id)).toEqual([])
    const first = await assigner.assign({
      actorUserId: admin.id,
      requestId: request.id,
      staffUserId: staff.id,
      idempotencyKey: 'assign-once',
    })
    const again = await assigner.assign({
      actorUserId: admin.id,
      requestId: request.id,
      staffUserId: staff.id,
      idempotencyKey: 'assign-once',
    })
    expect(again.assignmentId).toBe(first.assignmentId)
    expect(await prisma.staffAssignment.count({ where: { staffUserId: staff.id, revokedAt: null } })).toBe(1)
    expect((await queue.queue(staff.id)).map((row) => row.requestId)).toContain(request.id)
    const directory = await assigner.staff()
    expect(directory.some((row) => row.staffUserId === staff.id && row.displayName === 'Lan')).toBe(true)
    expect(JSON.stringify(directory)).not.toContain(staffEmail)
    await expect(
      assigner.assign({
        actorUserId: customer.id,
        requestId: request.id,
        staffUserId: staff.id,
        idempotencyKey: 'assign-customer',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})