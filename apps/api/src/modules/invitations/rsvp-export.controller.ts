import { Controller, Get, Headers, Param, Res } from '@nestjs/common'
import type { Response } from 'express'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { RsvpExportService } from './rsvp-export.service.js'

@Controller('invitations')
export class RsvpExportController {
  constructor(
    private readonly rsvpExports: RsvpExportService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':id/rsvp-export')
  async exportCsv(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const csv = await this.rsvpExports.exportCsv(user.id, id)
    response.setHeader('Cache-Control', 'private, no-store')
    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    response.setHeader('Content-Disposition', 'attachment; filename="rsvps.csv"')
    response.send(csv)
  }
}
