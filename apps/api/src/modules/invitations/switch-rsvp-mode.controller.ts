import { Body, Controller, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { SwitchRsvpModeService } from './switch-rsvp-mode.service.js'

@Controller('invitations')
export class SwitchRsvpModeController {
  constructor(
    private readonly modes: SwitchRsvpModeService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/rsvp-mode')
  @Header('Cache-Control', 'private, no-store')
  async switchMode(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { mode?: string; confirm?: boolean },
  ) {
    if (body.mode !== 'GUEST_LIST') {
      throw new UnprocessableEntityException('This invitation can switch to the guest list')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.modes.toGuestList(user.id, id, body.confirm === true)
    return { rsvpMode: 'GUEST_LIST' as const }
  }
}
