import { ConflictException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { digestToken } from '../identity/session-token.js'

export async function assertSameWeddingSwitch(
  slug: string,
  currentSessionToken: string | undefined,
  nextPartyId: string,
  confirmSwitch: boolean,
): Promise<void> {
  if (!currentSessionToken) return
  const prisma = getPrismaClient()
  const current = await prisma.guestGrant.findUnique({
    where: { tokenDigest: digestToken(currentSessionToken) },
  })
  if (!current || current.kind !== 'SESSION' || !current.partyId) return
  const handle = await prisma.invitationHandle.findFirst({
    where: { slug, revokedAt: null },
  })
  if (!handle || current.invitationId !== handle.invitationId) return
  if (current.partyId !== nextPartyId && !confirmSwitch) {
    throw new ConflictException('Confirm switching guest identity')
  }
}
