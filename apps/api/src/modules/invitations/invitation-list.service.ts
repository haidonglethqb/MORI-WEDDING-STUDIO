import { randomBytes } from 'node:crypto'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InvitationContentSchema } from '@mori/contracts'
import { getPrismaClient } from '@mori/database'

const emptyContent = {
  schemaVersion: 1 as const,
  displayNames: ['Tên một', 'Tên hai'] as [string, string],
  eventTitle: 'Lễ cưới',
}
const COMMAND = 'create-invitation'

export interface InvitationListItem {
  invitationId: string
  slug: string
  status: string
  eventTitle: string
  displayNames: [string, string]
}

@Injectable()
export class InvitationListService {
  async forOwner(ownerUserId: string): Promise<InvitationListItem[]> {
    const rows = await getPrismaClient().invitation.findMany({
      where: { project: { ownerUserId } },
      include: { draft: true, handles: { where: { revokedAt: null }, take: 1 } },
      orderBy: { id: 'asc' },
    })
    return rows.map((row) => {
      const parsed = InvitationContentSchema.safeParse(row.draft?.payload)
      const content = parsed.success ? parsed.data : null
      return {
        invitationId: row.id,
        slug: row.handles[0]?.slug ?? '',
        status: row.status,
        eventTitle: content?.eventTitle ?? '',
        displayNames: content?.displayNames ?? ['', ''],
      }
    })
  }

  async start(ownerUserId: string, idempotencyKey: string): Promise<InvitationListItem> {
    const key = idempotencyKey.trim()
    if (!key || key.length > 80) throw new UnprocessableEntityException('An idempotency key is required')
    const prisma = getPrismaClient()
    const invitationId = await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({
        where: { principalId_command_key: { principalId: ownerUserId, command: COMMAND, key } },
      })
      if (replay) return replay.resourceId
      const project = await tx.weddingProject.create({
        data: { ownerUserId, internalTitle: 'Thiệp của khách' },
      })
      const slug = `invite-${randomBytes(6).toString('base64url').toLowerCase()}`
      const invitation = await tx.invitation.create({
        data: {
          projectId: project.id,
          draft: { create: { payload: emptyContent, schemaVersion: 1 } },
          handles: { create: { slug } },
        },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: ownerUserId,
          command: COMMAND,
          key,
          requestHash: 'create-invitation',
          resourceId: invitation.id,
        },
      })
      return invitation.id
    })
    const items = await this.forOwner(ownerUserId)
    const created = items.find((item) => item.invitationId === invitationId)
    if (!created) throw new UnprocessableEntityException('The invitation could not be opened')
    return created
  }
}
