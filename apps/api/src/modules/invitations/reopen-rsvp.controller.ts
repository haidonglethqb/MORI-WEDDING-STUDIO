import { Body, Controller, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { ReopenRsvpService } from './reopen-rsvp.service.js'

@Controller('invitations')
export class ReopenRsvpController {
  constructor(
    private readonly reopen: ReopenRsvpService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/rsvp-deadline')
  @Header('Cache-Control', 'private, no-store')
  async reopenDeadline(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { deadline?: string },
  ) {
    const deadline = new Date(body.deadline ?? '')
    if (Number.isNaN(deadline.getTime())) {
      throw new UnprocessableEntityException('The RSVP deadline needs a date and time')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.reopen.reopen(user.id, id, deadline)
    return { rsvpDeadlineAt: deadline.toISOString() }
  }
}
