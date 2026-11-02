import { Controller, Get, Header, Headers, Param } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { OrderReadService } from './order-read.service.js'

@Controller('orders')
export class OrderListController {
  constructor(
    private readonly orders: OrderReadService,
    private readonly identity: IdentityService,
  ) {}

  @Get('mine')
  @Header('Cache-Control', 'private, no-store')
  async mine(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.orders.listForOwner(user.id)
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async one(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.orders.detail(user.id, id)
  }
}
