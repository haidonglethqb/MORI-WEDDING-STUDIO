import { Body, Controller, Get, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { QuoteOfferService } from './quote-offer.service.js'

const PRIVATE = 'private, no-store'

@Controller()
export class QuoteOfferController {
  constructor(
    private readonly offers: QuoteOfferService,
    private readonly identity: IdentityService,
  ) {}

  @Post('studio/requests/:id/quotes')
  @Header('Cache-Control', PRIVATE)
  async issue(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body()
    body: {
      totalAmountVnd?: string
      shippingAmountVnd?: string
      taxAmountVnd?: string
      scopeFingerprint?: string
      expiresAt?: string
      isFixture?: boolean
    },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.offers.issueFixture({
      actorUserId: user.id,
      requestId: id,
      totalAmountVnd: BigInt(body.totalAmountVnd ?? '-1'),
      shippingAmountVnd: BigInt(body.shippingAmountVnd ?? '-1'),
      taxAmountVnd: BigInt(body.taxAmountVnd ?? '-1'),
      scopeFingerprint: body.scopeFingerprint ?? '',
      expiresAt: new Date(body.expiresAt ?? ''),
      isFixture: body.isFixture === true,
    })
  }

  @Get('requests/:id/quotes')
  @Header('Cache-Control', PRIVATE)
  async list(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.offers.listForCustomer(user.id, id)
  }

  @Post('requests/:id/place-order')
  @Header('Cache-Control', PRIVATE)
  async place(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: { quoteId?: string; expectedVersion?: number; idempotencyKey?: string; shippingAddressId?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.offers.place({
      ownerUserId: user.id,
      requestId: id,
      quoteId: body.quoteId ?? '',
      expectedVersion: body.expectedVersion ?? -1,
      idempotencyKey: body.idempotencyKey ?? '',
      ...(body.shippingAddressId ? { shippingAddressId: body.shippingAddressId } : {}),
    })
  }
}
