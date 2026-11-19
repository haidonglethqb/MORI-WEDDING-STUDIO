import { Body, Controller, Header, Headers, Param, ParseUUIDPipe, Put } from '@nestjs/common'
import {
  ConfirmInvitationDemoPaymentSchema,
  SESSION_COOKIE,
  type ConfirmInvitationDemoPayment,
} from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { InvitationDemoPaymentService } from './invitation-demo-payment.js'

@Controller('invitations')
export class InvitationDemoPaymentController {
  constructor(
    private readonly payments: InvitationDemoPaymentService,
    private readonly identity: IdentityService,
  ) {}

  @Put(':id/demo-payment')
  @Header('Cache-Control', 'private, no-store')
  async confirm(
    @Headers('cookie') cookie: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ConfirmInvitationDemoPaymentSchema)) body: ConfirmInvitationDemoPayment,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.payments.confirm(user.id, id, body.method)
  }
}
