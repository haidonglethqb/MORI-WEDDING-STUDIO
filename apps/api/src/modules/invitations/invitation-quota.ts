import { ConflictException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

type Tx = Parameters<Parameters<ReturnType<typeof getPrismaClient>['$transaction']>[0]>[0]

export async function assertInvitationQuota(
  tx: Tx,
  ownerUserId: string,
  invitationId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM users WHERE id = ${ownerUserId}::uuid FOR UPDATE`
  const owner = await tx.user.findUnique({ where: { id: ownerUserId } })
  const quota = owner?.invitationQuota ?? 1
  const active = await tx.invitation.count({
    where: {
      status: 'PUBLISHED',
      id: { not: invitationId },
      project: { ownerUserId },
    },
  })
  if (active >= quota) throw new ConflictException('Invitation quota is full')
}
