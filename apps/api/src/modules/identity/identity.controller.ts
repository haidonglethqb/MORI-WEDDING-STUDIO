import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import {
  EmailOnlyRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
  SESSION_COOKIE,
  TokenRequestSchema,
} from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { AccountRecoveryService } from './account-recovery.service.js'
import { IdentityService } from './identity.service.js'
import { readCookie } from './read-cookie.js'

const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

function clearSessionCookie(response: Response): void {
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  )
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly identity: IdentityService,
    private readonly recovery: AccountRecoveryService,
  ) {}

  @Post('register')
  @HttpCode(202)
  register(
    @Body(new ZodValidationPipe(RegisterRequestSchema))
    body: ReturnType<typeof RegisterRequestSchema.parse>,
  ) {
    return this.identity.register(body)
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema))
    body: ReturnType<typeof LoginRequestSchema.parse>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.identity.login(body)
    response.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${result.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    )
    return { user: result.user }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Headers('cookie') cookie: string | undefined, @Res({ passthrough: true }) response: Response) {
    const result = await this.identity.logout(readCookie(cookie, SESSION_COOKIE))
    clearSessionCookie(response)
    return result
  }

  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(
    @Body(new ZodValidationPipe(TokenRequestSchema))
    body: ReturnType<typeof TokenRequestSchema.parse>,
  ) {
    return this.recovery.verifyEmail(body.token)
  }

  @Post('resend-verification')
  @HttpCode(202)
  resend(
    @Body(new ZodValidationPipe(EmailOnlyRequestSchema))
    body: ReturnType<typeof EmailOnlyRequestSchema.parse>,
  ) {
    return this.recovery.resendVerification(body.email)
  }

  @Post('forgot-password')
  @HttpCode(202)
  forgot(
    @Body(new ZodValidationPipe(EmailOnlyRequestSchema))
    body: ReturnType<typeof EmailOnlyRequestSchema.parse>,
  ) {
    return this.recovery.forgotPassword(body.email)
  }

  @Post('reset-password')
  @HttpCode(200)
  reset(
    @Body(new ZodValidationPipe(ResetPasswordRequestSchema))
    body: ReturnType<typeof ResetPasswordRequestSchema.parse>,
  ) {
    return this.recovery.resetPassword(body.token, body.password)
  }
}

@Controller()
export class MeController {
  constructor(private readonly identity: IdentityService) {}

  @Get('me')
  me(@Headers('cookie') cookie: string | undefined) {
    return this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
  }

  @Get('me/sessions')
  sessions(@Headers('cookie') cookie: string | undefined) {
    return this.identity.listSessions(readCookie(cookie, SESSION_COOKIE))
  }

  @Delete('me/sessions/:id')
  revoke(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    return this.identity.revokeSession(readCookie(cookie, SESSION_COOKIE), id)
  }
}
