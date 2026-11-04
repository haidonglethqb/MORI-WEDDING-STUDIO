import { Body, Controller, Header, Headers, HttpCode, Ip, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { GUEST_COOKIE } from '@mori/contracts'
import { readCookie } from '../../identity/read-cookie.js'
import { ModerationReportService } from './moderation-report.service.js'

@Controller('public/invitations')
export class PublicReportController {
  constructor(private readonly reports: ModerationReportService) {}

  @Post(':slug/reports')
  @HttpCode(200)
  @Header('Cache-Control', 'private, no-store')
  submit(
    @Param('slug') slug: string,
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Ip() ip: string | undefined,
    @Body() body: { reason?: string },
  ) {
    if (typeof body.reason !== 'string') {
      throw new UnprocessableEntityException('Report reason is required')
    }
    const guestToken = readCookie(cookie, GUEST_COOKIE)
    const forwardedIp = forwardedFor?.split(',')[0]?.trim()
    const reporterKey = guestToken ?? forwardedIp ?? ip ?? 'anonymous'
    return this.reports.submit(slug, reporterKey, body.reason)
  }
}
