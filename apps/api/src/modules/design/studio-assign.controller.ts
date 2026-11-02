import { Body, Controller, Get, Header, Headers, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { StudioAssignService } from './studio-assign.service.js'

const PRIVATE = 'private, no-store'

@Controller('studio')
export class StudioAssignController {
  constructor(
    private readonly assigner: StudioAssignService,
    private readonly identity: IdentityService,
  ) {}

  @Get('staff')
  @Header('Cache-Control', PRIVATE)
  async staff(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    if (user.role !== 'ADMIN' || user.status !== 'ACTIVE') return []
    return this.assigner.staff()
  }

  @Post('requests/:id/assignment')
  @Header('Cache-Control', PRIVATE)
  async assign(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { staffUserId?: string },
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.assigner.assign({
      actorUserId: user.id,
      requestId: id,
      staffUserId: body.staffUserId ?? '',
      idempotencyKey: idempotencyKey ?? '',
    })
  }
}
