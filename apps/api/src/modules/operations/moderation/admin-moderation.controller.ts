import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Param,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../../identity/identity.service.js'
import { readCookie } from '../../identity/read-cookie.js'
import { ModerationService } from './moderation.service.js'

@Controller('admin')
export class AdminModerationController {
  constructor(
    private readonly moderation: ModerationService,
    private readonly identity: IdentityService,
  ) {}

  @Get('moderation')
  @Header('Cache-Control', 'private, no-store')
  async list(@Headers('cookie') cookie: string | undefined) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.moderation.listQueue(user.id)
  }

  @Post('invitations/:id/moderation')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  async moderate(
    @Headers('cookie') cookie: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param('id') id: string,
    @Body() body: { action?: string; reason?: string; expectedVersion?: number },
  ) {
    const action = body.action === 'SUSPEND' ? 'SUSPEND' : body.action === 'RESTORE' ? 'RESTORE' : null
    const expectedVersion = body.expectedVersion
    if (
      action === null ||
      typeof body.reason !== 'string' ||
      typeof expectedVersion !== 'number' ||
      !Number.isInteger(expectedVersion) ||
      expectedVersion < 0
    ) {
      throw new UnprocessableEntityException('Moderation requires action, reason, and expectedVersion')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.moderation.moderate({
      adminUserId: user.id,
      invitationId: id,
      action,
      reason: body.reason,
      expectedVersion,
      idempotencyKey: idempotencyKey ?? '',
    })
  }
}
