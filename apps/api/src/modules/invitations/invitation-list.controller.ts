import { Controller, Get, Header, Headers, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { InvitationListService } from './invitation-list.service.js'

@Controller('invitations')
export class InvitationListController {
  constructor(
    private readonly list: InvitationListService,
    private readonly identity: IdentityService,
  ) {}

  @Get('mine')
  @Header('Cache-Control', 'private, no-store')
  async mine(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.list.forOwner(user.id)
  }

  @Post('mine')
  @Header('Cache-Control', 'private, no-store')
  async start(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.list.start(user.id, idempotencyKey ?? '')
  }
}
