import { randomUUID } from 'node:crypto'
import { NotFoundException } from '@nestjs/common'
import { ConfirmInvitationDemoPaymentSchema, type InvitationContent } from '@mori/contracts'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { InvitationDemoPaymentService } from './invitation-demo-payment.js'
import { InvitationEditorService } from './invitation-editor.service.js'
import { InvitationService } from './invitation.service.js'

const standard: InvitationContent = {
  schemaVersion: 1,
  displayNames: ['Mai', 'An'],
  eventTitle: 'Lễ cưới',
  templateId: 'editorial-vogue',
}
const bespoke: InvitationContent = { ...standard, templateId: 'custom-ai' }

describe('demo payment for bespoke invitations', () => {
  const invites = new InvitationService()
  const editor = new InvitationEditorService(invites)
  const payments = new InvitationDemoPaymentService()
  let ownerId = ''
  let otherId = ''

  beforeAll(async () => {
    const prisma = getPrismaClient()
    const createUser = (displayName: string) => prisma.user.create({
      data: { normalizedEmail: `${randomUUID()}@example.com`, displayName, invitationQuota: 5 },
    })
    const [owner, other] = await prisma.$transaction([createUser('Owner'), createUser('Other')])
    ownerId = owner.id
    otherId = other.id
  })

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({ where: { id: { in: [ownerId, otherId].filter(Boolean) } } })
    await disconnectPrismaClient()
  })

  async function draft(ownerId: string, content: InvitationContent) {
    const project = await invites.createProject(ownerId, 'Demo payment test')
    const invitation = await invites.createInvitation(ownerId, project.id)
    return editor.save(ownerId, invitation.id, { expectedVersion: 0, content })
  }

  it('requires an owner confirmation for each invitation before its guest link is live', async () => {
    const { invitationId, slug, version, demoPayment } = await draft(ownerId, bespoke)
    expect(demoPayment).toEqual({ amountVnd: '599000', isFixture: true, method: null })
    await expect(editor.publish(ownerId, invitationId, version)).rejects.toMatchObject({ status: 402 })
    await expect(invites.readPublished(slug)).rejects.toBeInstanceOf(NotFoundException)
    await expect(payments.confirm(otherId, invitationId, 'MOMO')).rejects.toBeInstanceOf(NotFoundException)

    const receipts = await Promise.all([
      payments.confirm(ownerId, invitationId, 'MOMO'),
      payments.confirm(ownerId, invitationId, 'BANK_QR'),
    ])
    expect(receipts[0]).toEqual(receipts[1])
    expect(receipts[0].method).not.toBeNull()
    expect(await payments.confirm(ownerId, invitationId, 'VNPAY')).toEqual(receipts[0])
    expect((await editor.read(ownerId, invitationId)).demoPayment).toEqual(receipts[0])
    await expect(invites.readPublished(slug)).rejects.toBeInstanceOf(NotFoundException)

    await editor.publish(ownerId, invitationId, version)
    const live = await invites.readPublished(slug)
    expect(live).toMatchObject({ displayNames: ['Mai', 'An'], templateId: 'custom-ai' })
    expect(live).not.toHaveProperty('demoPayment')

    const second = await draft(ownerId, bespoke)
    await expect(editor.publish(ownerId, second.invitationId, second.version)).rejects.toMatchObject({ status: 402 })
  })

  it('keeps standard invitations free and gates an upgrade to a bespoke design', async () => {
    const opened = await draft(ownerId, standard)
    expect(opened.demoPayment).toBeNull()
    await expect(payments.confirm(ownerId, opened.invitationId, 'MOMO')).rejects.toMatchObject({ status: 409 })
    const published = await editor.publish(ownerId, opened.invitationId, opened.version)
    const upgraded = await editor.save(ownerId, opened.invitationId, { expectedVersion: published.version, content: bespoke })
    await expect(editor.publish(ownerId, upgraded.invitationId, upgraded.version)).rejects.toMatchObject({ status: 402 })
    await expect(invites.readPublished(opened.slug)).resolves.toMatchObject({ templateId: 'editorial-vogue' })
  })

  it('preserves access and publication for an existing live bespoke invitation', async () => {
    const opened = await draft(ownerId, bespoke)
    const prisma = getPrismaClient()
    const revision = await prisma.invitationRevision.create({
      data: { invitationId: opened.invitationId, sequence: 1, schemaVersion: 1, payload: bespoke, contentHash: 'legacy-fixture' },
    })
    await prisma.invitation.update({
      where: { id: opened.invitationId },
      data: { status: 'PUBLISHED', publishedRevisionId: revision.id },
    })
    await expect(invites.readPublished(opened.slug)).resolves.toMatchObject({ templateId: 'custom-ai' })
    expect((await editor.read(ownerId, opened.invitationId)).demoPayment).toBeNull()
    await expect(editor.publish(ownerId, opened.invitationId, opened.version)).resolves.toMatchObject({ published: true })
  })

  it('accepts only a supported digital method and no client-supplied amount', () => {
    expect(ConfirmInvitationDemoPaymentSchema.safeParse({ method: 'VNPAY' }).success).toBe(true)
    expect(ConfirmInvitationDemoPaymentSchema.safeParse({ method: 'COD' }).success).toBe(false)
    expect(ConfirmInvitationDemoPaymentSchema.safeParse({ method: 'MOMO', amountVnd: '0' }).success).toBe(false)
  })
})
