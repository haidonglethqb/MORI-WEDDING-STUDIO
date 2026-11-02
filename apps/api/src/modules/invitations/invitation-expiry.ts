import { ConflictException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

type Tx = Parameters<Parameters<ReturnType<typeof getPrismaClient>['$transaction']>[0]>[0]

export async function markExpiredIfDue(invitationId: string): Promise<boolean> {
  const prisma = getPrismaClient()
  const rows = await prisma.$queryRaw<{ expired: boolean }[]>`
    SELECT ("expiresAt" IS NOT NULL AND "expiresAt" <= NOW()) AS expired
    FROM invitations
    WHERE id = ${invitationId}::uuid
      AND status = 'PUBLISHED'
  `
  if (!rows[0]?.expired) return false
  await prisma.invitation.updateMany({
    where: { id: invitationId, status: 'PUBLISHED' },
    data: { status: 'EXPIRED' },
  })
  return true
}

export async function assertExpiryAllowsPublish(tx: Tx, invitationId: string): Promise<void> {
  const rows = await tx.$queryRaw<{ blocked: boolean }[]>`
    SELECT ("expiresAt" IS NOT NULL AND "expiresAt" <= NOW()) AS blocked
    FROM invitations
    WHERE id = ${invitationId}::uuid
  `
  if (rows[0]?.blocked) {
    throw new ConflictException('Set a future expiry before publishing')
  }
}
