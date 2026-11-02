import { Controller, Get, Header, Param } from '@nestjs/common'
import { InvitationService } from './invitation.service.js'

export const GUEST_CACHE_CONTROL = 'private, no-store'

@Controller('public/invitations')
export class PublicInvitationController {
  constructor(private readonly invitations: InvitationService) {}

  @Get(':slug')
  @Header('Cache-Control', GUEST_CACHE_CONTROL)
  read(@Param('slug') slug: string) {
    return this.invitations.readPublished(slug)
  }
}
