import { Body, Controller, Get, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { StudioOrderService } from './studio-order.service.js'

const PRIVATE = 'private, no-store'

@Controller('studio/orders')
export class StudioOrderController {
  constructor(
    private readonly studio: StudioOrderService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @Header('Cache-Control', PRIVATE)
  async list(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.studio.list(user.id)
  }

  @Get(':id')
  @Header('Cache-Control', PRIVATE)
  async one(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.studio.read(user.id, id)
  }

  @Post(':id/advance')
  @Header('Cache-Control', PRIVATE)
  async advance(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { track?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const track = body.track === 'digital' ? 'digital' : 'physical'
    return this.studio.advance(user.id, id, track)
  }

  @Post(':id/cancellations/:cancellationId')
  @Header('Cache-Control', PRIVATE)
  async decide(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('cancellationId') cancellationId: string,
    @Body() body: { approve?: boolean; reason?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.studio.decideCancellation(user.id, id, cancellationId, body.approve === true, body.reason ?? '')
    return { cancellationId }
  }

  @Post(':id/exceptions')
  @Header('Cache-Control', PRIVATE)
  async exception(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { kind?: string; reason?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const reason = body.reason ?? ''
    if (body.kind === 'quality') await this.studio.failQuality(user.id, id, reason)
    else if (body.kind === 'shipment') await this.studio.recordShipment(user.id, id, reason)
    else await this.studio.hold(user.id, id, reason)
    return { orderId: id }
  }
}
