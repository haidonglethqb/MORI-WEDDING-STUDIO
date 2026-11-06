import { Controller, Get, Header, Param } from '@nestjs/common'
import { InvitationService } from './invitation.service.js'
import { calendarForPublishedEvent } from './invitation-calendar.js'

export const GUEST_CACHE_CONTROL = 'private, no-store'

@Controller('public/invitations')
export class PublicInvitationController {
  constructor(private readonly invitations: InvitationService) {}

  @Get(':slug')
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  read(@Param('slug') slug: string) {
    return this.invitations.readPublished(slug)
  }

  @Get(':slug/calendar')
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="mori-invitation.ics"')
  calendar(@Param('slug') slug: string) {
    return calendarForPublishedEvent(slug)
  }
}
