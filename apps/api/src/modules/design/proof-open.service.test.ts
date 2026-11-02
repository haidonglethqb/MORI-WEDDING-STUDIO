import { afterAll, describe, expect, it } from 'vitest'
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { approveProofCommand } from './proof-command.js'
import { ProofOpenService } from './proof-open.service.js'
import { ProofService } from './proof.service.js'

const staffEmail = `proof-open-staff-${Date.now()}@example.com`
const otherEmail = `proof-open-other-${Date.now()}@example.com`
const ownerEmail = `proof-open-owner-${Date.now()}@example.com`

describe('open a proof revision', () => {
  const proofs = new ProofOpenService(new ProofService())

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [staffEmail, otherEmail, ownerEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('lets assigned staff open a working proof and submit it when ready', async () => {
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
      data: { ownerUserId: owner.id, internalTitle: 'Proof open' },
    })
    const request = await prisma.serviceRequest.create({
      data: { projectId: project.id, ownerUserId: owner.id, isFixture: true },
    })
    await prisma.staffAssignment.create({ data: { projectId: project.id, staffUserId: staff.id } })

    const opened = await proofs.open({
      actorUserId: staff.id,
      requestId: request.id,
      manifestHash: 'fixture-proof-hash',
      idempotencyKey: 'open-once',
    })
    const replay = await proofs.open({
      actorUserId: staff.id,
      requestId: request.id,
      manifestHash: 'fixture-proof-hash',
      idempotencyKey: 'open-once',
    })
    expect(replay.revisionId).toBe(opened.revisionId)
    expect(opened.sequence).toBe(1)
    expect(await proofs.listForStaff(staff.id, request.id)).toEqual([
      { revisionId: opened.revisionId, sequence: 1, state: 'WORKING', manifestHash: 'fixture-proof-hash' },
    ])
    await expect(proofs.listForStaff(other.id, request.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      proofs.open({
        actorUserId: owner.id,
        requestId: request.id,
        manifestHash: 'customer-hash',
        idempotencyKey: 'open-customer',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      proofs.submit(other.id, request.id, opened.revisionId),
    ).rejects.toBeInstanceOf(NotFoundException)
    await expect(proofs.submit(staff.id, request.id, opened.revisionId)).rejects.toThrow(/not ready/i)

    await proofs.prepare(staff.id, opened.revisionId, {
      renderState: 'READY',
      faceMapComplete: true,
      fontsReady: true,
      trimWidthMm: 100,
      trimHeightMm: 150,
      profileWidthMm: 100,
      profileHeightMm: 150,
    })
    await proofs.submit(staff.id, request.id, opened.revisionId)
    const visible = await proofs.listForCustomer(owner.id, request.id)
    expect(visible).toEqual([
      { revisionId: opened.revisionId, sequence: 1, state: 'IN_REVIEW', manifestHash: 'fixture-proof-hash' },
    ])
    expect(JSON.stringify(visible)).not.toContain('Proof open')

    await expect(
      approveProofCommand(owner.id, opened.revisionId, { manifestHash: 'fixture-proof-hash' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)
    expect((await proofs.listForCustomer(owner.id, request.id))[0]?.state).toBe('IN_REVIEW')
    await approveProofCommand(owner.id, opened.revisionId, {
      manifestHash: 'fixture-proof-hash',
      scopeFingerprint: 'fixture-proof-hash',
      acknowledgementVersion: 'ack-1',
      acknowledgement: {
        names: true,
        dates: true,
        venues: true,
        quantitySpec: true,
        screenColour: true,
        version: true,
      },
    })
    expect((await proofs.listForCustomer(owner.id, request.id))[0]?.state).toBe('APPROVED')
    await expect(
      approveProofCommand(staff.id, opened.revisionId, {
        manifestHash: 'fixture-proof-hash',
        scopeFingerprint: 'fixture-proof-hash',
        acknowledgementVersion: 'ack-1',
        acknowledgement: {
          names: true,
          dates: true,
          venues: true,
          quantitySpec: true,
          screenColour: true,
          version: true,
        },
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})