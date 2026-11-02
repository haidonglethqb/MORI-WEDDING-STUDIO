import { Controller, Get, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { NotificationService } from './notification.service.js'

@Controller('me/notifications')
export class NotificationController {
  constructor(
    private readonly notices: NotificationService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.notices.list(user.id)
  }

  @Post(':id/read')
  @Header('Cache-Control', 'private, no-store')
  async read(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.notices.markRead(user.id, id)
    return { notificationId: id }
  }
}
