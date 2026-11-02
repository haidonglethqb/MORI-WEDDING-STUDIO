import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import type { PublicInvitation } from '@mori/contracts'
import { hashPassword, verifyPassword } from '../identity/password.js'
import { createSessionToken, digestToken } from '../identity/session-token.js'
import { markExpiredIfDue } from './invitation-expiry.js'
import { livePublicInvitation } from './live-public-invitation.js'
import { toPublicInvitation } from './public-invitation.js'

const GRANT_MS = 12 * 60 * 60 * 1000

@Injectable()
export class PasscodeService {
  async setPasscode(ownerUserId: string, invitationId: string, passcode: string): Promise<void> {
    if (passcode.length < 8 || passcode.length > 128) throw new NotFoundException()
    const passcodeHash = await hashPassword(passcode)
    const updated = await getPrismaClient().invitation.updateMany({
      where: { id: invitationId, project: { ownerUserId } },
      data: { accessMode: 'PASSCODE', passcodeHash, accessEpoch: { increment: 1 } },
    })
    if (updated.count !== 1) throw new NotFoundException()
  }

  async exchange(slug: string, passcode: string): Promise<string> {
    const invitation = await publishedInvitation(slug)
    if (!invitation.passcodeHash) throw new NotFoundException()
    const matches = await verifyPassword(invitation.passcodeHash, passcode)
    if (!matches) throw new NotFoundException()
    const { token, digest } = createSessionToken()
    await getPrismaClient().guestGrant.create({
      data: {
        invitationId: invitation.id,
        tokenDigest: digest,
        accessEpoch: invitation.accessEpoch,
        expiresAt: new Date(Date.now() + GRANT_MS),
      },
    })
    return token
  }

  async readGranted(slug: string, token: string): Promise<PublicInvitation> {
    const invitation = await publishedInvitation(slug)
    const grant = await getPrismaClient().guestGrant.findUnique({
      where: { tokenDigest: digestToken(token) },
    })
    if (
      !grant ||
      grant.invitationId !== invitation.id ||
      grant.accessEpoch !== invitation.accessEpoch ||
      grant.expiresAt <= new Date()
    ) {
      throw new NotFoundException()
    }
    return toPublicInvitation(slug, invitation.publishedRevision?.payload)
  }
}

async function publishedInvitation(slug: string) {
  const handle = await getPrismaClient().invitationHandle.findFirst({
    where: { slug, revokedAt: null, invitation: livePublicInvitation },
    include: { invitation: { include: { publishedRevision: true } } },
  })
  if (!handle?.invitation.publishedRevision || (await markExpiredIfDue(handle.invitation.id))) {
    throw new NotFoundException()
  }
  return handle.invitation
}
