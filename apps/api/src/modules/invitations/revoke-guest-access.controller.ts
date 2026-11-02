import { Body, Controller, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { RevokeGuestAccessService } from './revoke-guest-access.service.js'

@Controller('invitations')
export class RevokeGuestAccessController {
  constructor(
    private readonly access: RevokeGuestAccessService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/revoke-guest-access')
  @Header('Cache-Control', 'private, no-store')
  async revoke(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { expectedVersion?: number; confirm?: boolean },
  ) {
    const key = idempotencyKey?.trim() ?? ''
    const expectedVersion = body.expectedVersion
    if (key.length < 1 || key.length > 80 || typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) {
      throw new UnprocessableEntityException('This command needs a version and an idempotency key')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.access.revokeAll({
      ownerUserId: user.id,
      invitationId: id,
      expectedVersion,
      idempotencyKey: key,
      confirm: body.confirm === true,
    })
  }
}
