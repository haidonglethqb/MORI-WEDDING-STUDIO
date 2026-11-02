import { afterAll, describe, expect, it } from 'vitest'
import { UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { approveProofCommand } from './proof-command.js'

const ownerEmail = `approve-owner-${Date.now()}@example.com`
const otherEmail = `approve-other-${Date.now()}@example.com`

describe('approveProofCommand', () => {
  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, otherEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('rejects a body that sets role, owner, total, or approval actor', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner' },
    })
    const other = await prisma.user.create({
      data: { normalizedEmail: otherEmail, displayName: 'Other' },
    })
    const project = await prisma.weddingProject.create({
      data: { ownerUserId: owner.id, internalTitle: 'Approve command' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    const revision = await prisma.designRevision.create({
      data: {
        requestId: request.id,
        sequence: 1,
        state: 'IN_REVIEW',
        manifestHash: 'hash-command',
        renderState: 'READY',
        faceMapComplete: true,
        isFixture: true,
      },
    })

    await expect(approveProofCommand(owner.id, revision.id, {
      manifestHash: 'hash-command',
      role: 'ADMIN',
      ownerUserId: other.id,
      totalAmountVnd: '1',
      approvalActor: other.id,
    })).rejects.toBeInstanceOf(UnprocessableEntityException)
    expect(await prisma.proofApproval.count({ where: { revisionId: revision.id } })).toBe(0)
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: revision.id } })).state).toBe(
      'IN_REVIEW',
    )

    await approveProofCommand(owner.id, revision.id, {
      manifestHash: 'hash-command',
      scopeFingerprint: 'scope-command',
      acknowledgementVersion: 'fixture-ack-1',
      acknowledgement: {
        names: true,
        dates: true,
        venues: true,
        quantitySpec: true,
        screenColour: true,
        version: true,
      },
    })
    const approval = await prisma.proofApproval.findUniqueOrThrow({ where: { revisionId: revision.id } })
    expect(approval.ownerUserId).toBe(owner.id)
    expect(approval.manifestHash).toBe('hash-command')
    expect(approval.acknowledgementVersion).toBe('fixture-ack-1')
    expect((await prisma.designRevision.findUniqueOrThrow({ where: { id: revision.id } })).state).toBe('APPROVED')
  })
})