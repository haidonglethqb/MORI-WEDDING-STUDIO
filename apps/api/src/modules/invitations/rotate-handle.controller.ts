import { Body, Controller, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { RotateHandleService } from './rotate-handle.service.js'

@Controller('invitations')
export class RotateHandleController {
  constructor(
    private readonly handles: RotateHandleService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/rotate-handle')
  @Header('Cache-Control', 'private, no-store')
  async rotate(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { expectedVersion?: number },
  ) {
    const key = idempotencyKey?.trim() ?? ''
    const expectedVersion = body.expectedVersion
    if (key.length < 1 || key.length > 80 || typeof expectedVersion !== 'number' || !Number.isInteger(expectedVersion)) {
      throw new UnprocessableEntityException('This command needs a version and an idempotency key')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.handles.rotate({
      ownerUserId: user.id,
      invitationId: id,
      expectedVersion,
      idempotencyKey: key,
    })
  }
}
