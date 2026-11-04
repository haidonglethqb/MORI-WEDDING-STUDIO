import { afterAll, describe, expect, it } from 'vitest'
import {
  ConflictException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { InvitationEditorService } from '../../invitations/invitation-editor.service.js'
import { InvitationService } from '../../invitations/invitation.service.js'
import { ModerationReportService } from './moderation-report.service.js'
import { ModerationService } from './moderation.service.js'

const ownerEmail = `mod-owner-${Date.now()}@example.com`
const adminEmail = `mod-admin-${Date.now()}@example.com`
const staffEmail = `mod-staff-${Date.now()}@example.com`

describe('ModerationService and ModerationReportService', () => {
  const invitations = new InvitationService()
  const editor = new InvitationEditorService(invitations)
  const reports = new ModerationReportService()
  const moderation = new ModerationService()

  afterAll(async () => {
    await getPrismaClient().user.deleteMany({
      where: { normalizedEmail: { in: [ownerEmail, adminEmail, staffEmail] } },
    })
    await disconnectPrismaClient()
  })

  it('records abuse reports privately, enforces rate limits, suspends with owner reason, and restores without resurrecting unpublished invitations', async () => {
    const prisma = getPrismaClient()
    const owner = await prisma.user.create({
      data: { normalizedEmail: ownerEmail, displayName: 'Owner', role: 'CUSTOMER', status: 'ACTIVE' },
    })
    const admin = await prisma.user.create({
      data: { normalizedEmail: adminEmail, displayName: 'Admin', role: 'ADMIN', status: 'ACTIVE' },
    })
    const staff = await prisma.user.create({
      data: { normalizedEmail: staffEmail, displayName: 'Staff', role: 'STUDIO', status: 'ACTIVE' },
    })

    const project = await invitations.createProject(owner.id, 'Private Wedding Internal Title')
    const created = await invitations.createInvitation(owner.id, project.id)
    const saved = await invitations.saveDraft(owner.id, created.id, {
      expectedVersion: 0,
      content: { schemaVersion: 1, displayNames: ['Mai', 'An'], eventTitle: 'Lễ cưới' },
    })
    const slug = (await editor.read(owner.id, created.id)).slug

    // Unpublished invitations cannot be reported publicly
    await expect(reports.submit(slug, `rep-a-${Date.now()}`, 'Nội dung lạ')).rejects.toBeInstanceOf(
      NotFoundException,
    )

    await invitations.publish(owner.id, created.id, saved.version)

    const reporterKey = `reporter-${Date.now()}`
    const res1 = await reports.submit(slug, reporterKey, 'Nội dung mạo danh')
    expect(res1).toEqual({ accepted: true })
    expect(JSON.stringify(res1).includes(ownerEmail)).toBe(false)

    await reports.submit(slug, reporterKey, 'Báo cáo lần 2')
    await reports.submit(slug, reporterKey, 'Báo cáo lần 3')
    await expect(reports.submit(slug, reporterKey, 'Spam lần 4')).rejects.toThrow(HttpException)

    // Stored report never keeps raw reporter key
    const storedReport = await prisma.moderationReport.findFirstOrThrow({
      where: { invitationId: created.id },
    })
    expect(storedReport.reporterDigest).not.toBe(reporterKey)
    expect(storedReport.state).toBe('OPEN')

    // Non-admin cannot view queue or moderate (404 per HR-3)
    await expect(moderation.listQueue(staff.id)).rejects.toBeInstanceOf(NotFoundException)
    await expect(
      moderation.moderate({
        adminUserId: staff.id,
        invitationId: created.id,
        action: 'SUSPEND',
        reason: 'Xác minh quyền nội dung',
        expectedVersion: 0,
        idempotencyKey: 'staff-attempt-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)

    const queueBefore = await moderation.listQueue(admin.id)
    const itemBefore = queueBefore.find((i) => i.invitationId === created.id)
    expect(itemBefore?.openReportCount).toBe(3)

    // Admin suspends with reason + idempotency replay + version check
    const suspended = await moderation.moderate({
      adminUserId: admin.id,
      invitationId: created.id,
      action: 'SUSPEND',
      reason: 'Cần xác minh quyền sử dụng hình ảnh',
      expectedVersion: 0,
      idempotencyKey: 'mod-suspend-1',
    })
    expect(suspended).toEqual({ moderationState: 'SUSPENDED', status: 'PUBLISHED', version: 1 })

    const replay = await moderation.moderate({
      adminUserId: admin.id,
      invitationId: created.id,
      action: 'SUSPEND',
      reason: 'Cần xác minh quyền sử dụng hình ảnh',
      expectedVersion: 0,
      idempotencyKey: 'mod-suspend-1',
    })
    expect(replay).toEqual(suspended)

    await expect(
      moderation.moderate({
        adminUserId: admin.id,
        invitationId: created.id,
        action: 'SUSPEND',
        reason: 'Lý do khác cùng khóa',
        expectedVersion: 1,
        idempotencyKey: 'mod-suspend-1',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException)

    await expect(
      moderation.moderate({
        adminUserId: admin.id,
        invitationId: created.id,
        action: 'RESTORE',
        reason: 'Khôi phục với phiên bản cũ',
        expectedVersion: 0,
        idempotencyKey: 'mod-stale-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    // Public view is generically unavailable (TC-064), while owner sees reason privately
    await expect(invitations.readPublished(slug)).rejects.toBeInstanceOf(NotFoundException)
    const ownerView = await editor.read(owner.id, created.id)
    expect(ownerView.moderationState).toBe('SUSPENDED')
    expect(ownerView.moderationReason).toBe('Cần xác minh quyền sử dụng hình ảnh')

    // Owner unpublishes while suspended; admin restore clears hold ONLY (no resurrection!)
    const invRow = await prisma.invitation.findUniqueOrThrow({ where: { id: created.id } })
    await invitations.unpublish(owner.id, created.id, invRow.draftVersion)

    const restored = await moderation.moderate({
      adminUserId: admin.id,
      invitationId: created.id,
      action: 'RESTORE',
      reason: 'Chủ thiệp đã gỡ nội dung tranh chấp',
      expectedVersion: 1,
      idempotencyKey: 'mod-restore-1',
    })
    expect(restored).toEqual({ moderationState: 'ACTIVE', status: 'UNPUBLISHED', version: 2 })
    await expect(invitations.readPublished(slug)).rejects.toBeInstanceOf(NotFoundException)

    const ownerAfter = await editor.read(owner.id, created.id)
    expect(ownerAfter.moderationState).toBe('ACTIVE')
    expect(ownerAfter.moderationReason).toBeNull()

    const queueAfter = await moderation.listQueue(admin.id)
    const itemAfter = queueAfter.find((i) => i.invitationId === created.id)
    expect(itemAfter?.openReportCount).toBe(0)
    expect(itemAfter?.decisions.map((d) => d.action)).toEqual(['RESTORE', 'SUSPEND'])
  })
})
