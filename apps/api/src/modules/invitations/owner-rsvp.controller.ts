import { Body, Controller, Header, Headers, Param, Post, UnprocessableEntityException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { OwnerRsvpService } from './owner-rsvp.service.js'

@Controller('invitations')
export class OwnerRsvpController {
  constructor(
    private readonly corrections: OwnerRsvpService,
    private readonly identity: IdentityService,
  ) {}

  @Post(':id/parties/:partyId/correction')
  @Header('Cache-Control', 'private, no-store')
  async correct(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Param('partyId') partyId: string,
    @Body()
    body: {
      eventId?: string
      expectedVersion?: number
      status?: string
      attendeeCount?: number
      reason?: string
    },
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
      throw new UnprocessableEntityException('A correction needs an event, a version, and an answer')
    }
    const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
    return this.corrections.correct({
      ownerUserId: user.id,
      invitationId: id,
      partyId,
      eventId: body.eventId,
      expectedVersion,
      status,
      attendeeCount,
      reason: body.reason ?? '',
    })
  }
}
