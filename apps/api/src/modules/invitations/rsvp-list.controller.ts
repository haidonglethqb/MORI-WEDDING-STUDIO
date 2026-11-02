import { Controller, Get, Header, Headers, Param } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { RsvpListService } from './rsvp-list.service.js'

@Controller('invitations')
export class RsvpListController {
  constructor(
    private readonly lists: RsvpListService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':id/rsvps')
  @Header('Cache-Control', 'private, no-store')
  async list(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.lists.list(user.id, id)
  }
}
