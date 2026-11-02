import { Body, Controller, Get, Header, Headers, HttpCode, Param, Post, Res, UnprocessableEntityException } from '@nestjs/common'
import type { Response } from 'express'
import { GUEST_COOKIE, GuestLinkExchangeSchema } from '@mori/contracts'
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js'
import { readCookie } from '../identity/read-cookie.js'
import { GuestLinkService } from './guest-link.service.js'
import { GuestRsvpService } from './guest-rsvp.service.js'
import { GUEST_CACHE_CONTROL } from './public-invitation.controller.js'

@Controller('public/invitations')
export class GuestSessionController {
  constructor(
    private readonly links: GuestLinkService,
    private readonly rsvp: GuestRsvpService,
  ) {}

  @Post(':slug/guest-session')
  @HttpCode(200)
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  async exchange(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(GuestLinkExchangeSchema)) body: { secret: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ partyName: string }> {
    const opened = await this.links.exchange(slug, body.secret)
    const maxAge = Math.max(0, Math.floor((opened.expiresAt.getTime() - Date.now()) / 1000))
    response.setHeader(
      'Set-Cookie',
      `${GUEST_COOKIE}=${opened.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    )
    return { partyName: opened.partyName }
  }

  @Get(':slug/guest')
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  read(@Param('slug') slug: string, @Headers('cookie') cookie: string | undefined) {
    return this.links.readSession(slug, readCookie(cookie, GUEST_COOKIE) ?? '')
  }

  @Get(':slug/rsvp')
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  sheet(@Param('slug') slug: string, @Headers('cookie') cookie: string | undefined) {
    return this.rsvp.sheet(slug, readCookie(cookie, GUEST_COOKIE) ?? '')
  }

  @Post(':slug/rsvp')
  @HttpCode(200)
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  answer(
    @Param('slug') slug: string,
    @Headers('cookie') cookie: string | undefined,
    @Body() body: { eventId?: string; expectedVersion?: number; status?: string; attendeeCount?: number },
  ) {
    const status = body.status === 'DECLINED' ? 'DECLINED' : body.status === 'ATTENDING' ? 'ATTENDING' : null
    const expectedVersion = body.expectedVersion
    const attendeeCount = body.attendeeCount
    if (
      !body.eventId ||
      status === null ||
      typeof expectedVersion !== 'number' ||
      typeof attendeeCount !== 'number' ||
      !Number.isInteger(expectedVersion) ||
      !Number.isInteger(attendeeCount)
    ) {
      throw new UnprocessableEntityException('An RSVP needs an event, a version, and an answer')
    }
    return this.rsvp.answer(slug, readCookie(cookie, GUEST_COOKIE) ?? '', {
      eventId: body.eventId,
      expectedVersion,
      status,
      attendeeCount,
    })
  }
}
