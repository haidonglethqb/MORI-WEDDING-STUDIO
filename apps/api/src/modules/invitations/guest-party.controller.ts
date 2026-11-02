import { Body, Controller, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { ExcludePartyService } from './exclude-party.service.js'
import { GuestPartyService } from './guest-party.service.js'
import { RevokePartyLinkService } from './revoke-party-link.service.js'

const PRIVATE = 'private, no-store'

@Controller('invitations')
export class GuestPartyController {
  constructor(
    private readonly parties: GuestPartyService,
    private readonly links: RevokePartyLinkService,
    private readonly exclusions: ExcludePartyService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/parties')
  @Header('Cache-Control', PRIVATE)
  async create(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { displayName?: string; maxAttendees?: number },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.parties.create({
      ownerUserId: user.id,
      invitationId: id,
      displayName: body.displayName ?? '',
      maxAttendees: body.maxAttendees ?? 0,
      idempotencyKey: idempotencyKey ?? '',
    })
  }

  @Post(':id/parties/:partyId/link')
  @Header('Cache-Control', PRIVATE)
  async link(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Param('partyId') partyId: string,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.parties.issueLink({
      ownerUserId: user.id,
      invitationId: id,
      partyId,
      idempotencyKey: idempotencyKey ?? '',
    })
  }

  @Post(':id/parties/:partyId/revoke')
  @Header('Cache-Control', PRIVATE)
  async revoke(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('partyId') partyId: string,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.links.revoke(user.id, partyId, id)
  }

  @Post(':id/parties/:partyId/exclude')
  @Header('Cache-Control', PRIVATE)
  async exclude(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('partyId') partyId: string,
    @Body() body: { reason?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.exclusions.exclude(user.id, partyId, body.reason ?? '', id)
    return { partyId }
  }
}
