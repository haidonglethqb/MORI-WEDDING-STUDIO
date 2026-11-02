import { Body, Controller, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { OrderActionService } from './order-action.service.js'

const PRIVATE = 'private, no-store'

@Controller()
export class OrderActionController {
  constructor(
    private readonly actions: OrderActionService,
    private readonly identity: IdentityService,
  ) {}

  @Post('studio/orders/:id/confirm')
  @Header('Cache-Control', PRIVATE)
  async confirm(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.actions.confirm(user.id, id, idempotencyKey ?? '')
  }

  @Post('orders/:id/cancellation-requests')
  @Header('Cache-Control', PRIVATE)
  async cancel(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.actions.requestCancellation(user.id, id, body.reason ?? '', idempotencyKey ?? '')
  }
}
