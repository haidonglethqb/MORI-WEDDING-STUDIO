import { Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { createSessionToken, digestToken } from '../identity/session-token.js'
import { markExpiredIfDue } from './invitation-expiry.js'
import { livePublicInvitation } from './live-public-invitation.js'
import { assertSameWeddingSwitch } from './party-switch.js'
import { toPublicInvitation } from './public-invitation.js'

const LINK_DAYS = 180

@Injectable()
export class GuestLinkService {
  async issue(ownerUserId: string, invitationId: string, partyId: string): Promise<string> {
    const prisma = getPrismaClient()
    const party = await prisma.guestParty.findFirst({
      where: {
        id: partyId,
        invitationId,
        invitation: { status: 'PUBLISHED', project: { ownerUserId } },
      },
      include: { invitation: true },
    })
    if (!party) throw new NotFoundException()
    const { token, digest } = createSessionToken()
    const expiresAt = new Date(Date.now() + LINK_DAYS * 24 * 60 * 60 * 1000)
    await prisma.guestGrant.create({
      data: {
        invitationId,
        partyId,
        kind: 'LINK',
        tokenDigest: digest,
        accessEpoch: party.invitation.accessEpoch,
        partyLinkVersion: party.linkVersion,
        expiresAt,
      },
    })
    return token
  }

  async exchange(
    slug: string,
    token: string,
    options?: { currentSessionToken?: string; confirmSwitch?: boolean },
  ): Promise<GuestSession> {
    const grant = await this.openGrant(slug, token, 'LINK')
    await assertSameWeddingSwitch(
      slug,
      options?.currentSessionToken,
      grant.partyId,
      options?.confirmSwitch === true,
    )
    const { token: sessionToken, digest } = createSessionToken()
    await getPrismaClient().guestGrant.create({
      data: {
        invitationId: grant.invitationId,
        partyId: grant.partyId,
        kind: 'SESSION',
        tokenDigest: digest,
        accessEpoch: grant.accessEpoch,
        partyLinkVersion: grant.partyLinkVersion,
        expiresAt: grant.expiresAt,
      },
    })
    return { partyName: grant.partyName, sessionToken, expiresAt: grant.expiresAt }
  }

  async sessionPartyId(slug: string, token: string): Promise<string> {
    return (await this.openGrant(slug, token, 'SESSION')).partyId
  }

  async readSession(slug: string, token: string) {
    const grant = await this.openGrant(slug, token, 'SESSION')
    const handle = await getPrismaClient().invitationHandle.findFirst({
      where: { slug, revokedAt: null, invitation: livePublicInvitation },
      include: { invitation: { include: { publishedRevision: true } } },
    })
    if (!handle?.invitation.publishedRevision) throw new NotFoundException()
    return {
      partyName: grant.partyName,
      ...toPublicInvitation(slug, handle.invitation.publishedRevision.payload),
    }
  }

  private async openGrant(slug: string, token: string, kind: 'LINK' | 'SESSION') {
    const prisma = getPrismaClient()
    const handle = await prisma.invitationHandle.findFirst({
      where: { slug, revokedAt: null, invitation: livePublicInvitation },
      include: { invitation: true },
    })
    if (!handle || (await markExpiredIfDue(handle.invitation.id))) throw new NotFoundException()
    const grant = await prisma.guestGrant.findUnique({ where: { tokenDigest: digestToken(token) } })
    if (!grant?.partyId || grant.kind !== kind || grant.invitationId !== handle.invitationId) {
      throw new NotFoundException()
    }
    if (grant.accessEpoch !== handle.invitation.accessEpoch) throw new NotFoundException()
    const open = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM guest_grants
      WHERE id = ${grant.id}::uuid AND "expiresAt" > NOW()
    `
    if (!open[0]) throw new NotFoundException()
    const party = await prisma.guestParty.findFirst({
      where: { id: grant.partyId, invitationId: handle.invitationId },
    })
    if (!party || party.linkVersion !== grant.partyLinkVersion) throw new NotFoundException()
    return {
      invitationId: handle.invitationId,
      partyId: party.id,
      partyName: party.displayName,
      accessEpoch: grant.accessEpoch,
      partyLinkVersion: grant.partyLinkVersion,
      expiresAt: grant.expiresAt,
    }
  }
}

interface GuestSession {
  partyName: string
  sessionToken: string
  expiresAt: Date
}
