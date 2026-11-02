import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { approveProofCommand } from './proof-command.js'
import { ProofService } from './proof.service.js'

const ownerEmail = `ack-owner-${Date.now()}@example.com`
const staffEmail = `ack-staff-${Date.now()}@example.com`

const complete = {
  names: true,
  dates: true,
  venues: true,
  quantitySpec: true,
  screenColour: true,
  version: true,
}

describe('proof acknowledgement', () => {
  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('rejects approval when a required acknowledgement is omitted', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Acknowledgement' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const omitted = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 1, state: 'IN_REVIEW', manifestHash: 'hash-omit', isFixture: true },
    })
    const staffRevision = await prisma.designRevision.create({
      data: { requestId: request.id, sequence: 2, state: 'IN_REVIEW', manifestHash: 'hash-staff', isFixture: true },
    })

    await expect(
      approveProofCommand(owner.id, omitted.id, {
        manifestHash: 'hash-omit',
        scopeFingerprint: 'scope-omit',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement: { dates: true, venues: true, quantitySpec: true, screenColour: true, version: true },
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
    expect(await prisma.proofApproval.count({ where: { revisionId: omitted.id } })).toBe(0)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: omitted.id } })).state).toBe('IN_REVIEW')

    await expect(
      new ProofService().approve({
        actorUserId: staff.id,
        revisionId: staffRevision.id,
        manifestHash: 'hash-staff',
        scopeFingerprint: 'scope-staff',
        acknowledgementVersion: 'fixture-ack-1',
        acknowledgement: complete,
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(await prisma.proofApproval.count({ where: { revisionId: staffRevision.id } })).toBe(0)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: staffRevision.id } })).state).toBe(
      'IN_REVIEW',
    )
  })
})