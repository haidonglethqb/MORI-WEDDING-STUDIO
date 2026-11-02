import { Controller, Get, Header, Headers, NotFoundException, Param, Post } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { getPrismaClient } from '@mori/database'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { EventRetireService } from './event-retire.service.js'

@Controller('invitations')
export class InvitationEventController {
  constructor(
    private readonly events: EventRetireService,
    private readonly identity: IdentityService,
  ) {}

  @Get(':id/events')
  @Header('Cache-Control', 'private, no-store')
  async list(@Headers('cookie') cookie: string | undefined, @Param('id') id: string) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    const invitation = await getPrismaClient().invitation.findFirst({
      where: { id, project: { ownerUserId: user.id } },
      include: { events: { orderBy: { title: 'asc' } } },
    })
    if (!invitation) throw new NotFoundException()
    return invitation.events.map((event) => ({
      eventId: event.id,
      title: event.title,
      retired: event.retiredAt !== null,
    }))
  }

  @Post(':id/events/:eventId/retire')
  @Header('Cache-Control', 'private, no-store')
  async retire(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.events.retire(user.id, eventId, id)
  }
}
