import { Body, Controller, Get, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { RequestMessagesService } from './request-messages.service.js'
import { StudioQueueService } from './studio-queue.service.js'

@Controller('studio/requests')
export class StudioQueueController {
  constructor(
    private readonly queue: StudioQueueService,
    private readonly messages: RequestMessagesService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  async list(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.queue.queue(user.id)
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async read(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.queue.read(user.id, id)
  }

  @Post(':id/messages')
  @Header('Cache-Control', 'private, no-store')
  async reply(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { plainText?: string; visibility?: 'CUSTOMER' | 'INTERNAL' },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.messages.reply({
      actorUserId: user.id,
      requestId: id,
      plainText: body.plainText ?? '',
      visibility: body.visibility === 'INTERNAL' ? 'INTERNAL' : 'CUSTOMER',
      idempotencyKey: idempotencyKey ?? '',
    })
    return { accepted: true }
  }
}
