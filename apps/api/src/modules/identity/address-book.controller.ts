import { Body, Controller, Delete, Get, Header, Headers, Param, Patch, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { AddressBookService, type AddressInput } from './address-book.service.js'
import { IdentityService } from './identity.service.js'
import { readCookie } from './read-cookie.js'

const PRIVATE = 'private, no-store'

@Controller('me/addresses')
export class AddressBookController {
  constructor(
    private readonly addresses: AddressBookService,
    private readonly identity: IdentityService,
  ) {}

  @Get()
  @Header('Cache-Control', PRIVATE)
  async list(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.addresses.list(user.id)
  }

  @Post()
  @Header('Cache-Control', PRIVATE)
  async create(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: AddressInput,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.addresses.create(user.id, body, idempotencyKey ?? '')
  }

  @Patch(':id')
  @Header('Cache-Control', PRIVATE)
  async update(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: AddressInput & { expectedVersion?: number },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.addresses.update(user.id, id, body.expectedVersion ?? -1, body)
  }

  @Delete(':id')
  @Header('Cache-Control', PRIVATE)
  async archive(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    await this.addresses.archive(user.id, id)
    return { addressId: id }
  }
}
