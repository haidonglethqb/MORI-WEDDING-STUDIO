import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProjectAccessService } from './project-access.service.js'

const ownerEmail = `owner-access-${Date.now()}@example.com`
const staffEmail = `staff-access-${Date.now()}@example.com`

describe('ProjectAccessService', () => {
  const access = new ProjectAccessService()

  afterAll(async () => {
    const prisma = getPrismaClient()
    await prisma.user.deleteMany({ where: { normalizedEmail: { in: [ownerEmail, staffEmail] } } })
    await disconnectPrismaClient()
  })

  it('hides a project from studio staff who are not assigned', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', role: 'CUSTOMER' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Private wedding' },
    })

    expect((await access.read(owner.id, project.id)).internalTitle).toBe('Private wedding')
    await expect(access.read(staff.id, project.id)).rejects.toBeInstanceOf(NotFoundException)

    const assignment = await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id },
    })
    expect((await access.read(staff.id, project.id)).id).toBe(project.id)

    await prisma.staffAssignment.update({
      where: { id: assignment.id },
      data: { revokedAt: new Date() },
    })
    await expect(access.read(staff.id, project.id)).rejects.toBeInstanceOf(NotFoundException)
  })
})