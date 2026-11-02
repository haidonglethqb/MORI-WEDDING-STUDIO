import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { ProofService } from './proof.service.js'

const ownerEmail = `proof-owner-${Date.now()}@example.com`
const otherEmail = `proof-other-${Date.now()}@example.com`
const staffEmail = `proof-staff-${Date.now()}@example.com`

describe('ProofService read', () => {
  const proofs = new ProofService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('shows a proof only to the owner and assigned staff', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', status: 'ACTIVE' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Private proof' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'APPROVED',
        manifestHash: 'hash-private',
        isFixture: true,
        approval: { create: { ownerUserId: owner.id, manifestHash: 'hash-private', acknowledgementVersion: 'fixture-ack-1' } },
      },
    })

    await expect(proofs.read(other.id, revision.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(proofs.read(staff.id, revision.id)).rejects.toBeInstanceOf(NotFoundException)
    expect(await proofs.read(owner.id, revision.id)).toEqual({
      revisionId: revision.id,
      sequence: 1,
      state: 'APPROVED',
      manifestHash: 'hash-private',
    })
    expect(JSON.stringify(await proofs.read(owner.id, revision.id)).includes(ownerEmail)).toBe(false)

    await prisma.staffAssignment.create({
      data: { projectId: project.id, staffUserId: staff.id },
    })
    expect((await proofs.read(staff.id, revision.id)).manifestHash).toBe('hash-private')
  })
})