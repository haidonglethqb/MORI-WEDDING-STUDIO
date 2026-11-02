import { NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { buildEventCalendar } from '@mori/domain'
import { markExpiredIfDue } from './invitation-expiry.js'
import { livePublicInvitation } from './live-public-invitation.js'

export async function calendarForPublishedEvent(slug: string): Promise<string> {
  const handle = await getPrismaClient().invitationHandle.findFirst({
    where: { slug, revokedAt: null, invitation: livePublicInvitation },
    include: { invitation: { include: { events: true } } },
  })
  const event = handle?.invitation.events.find((item) => item.stableEventKey === 'primary')
  if (!handle || !event?.localStart || !event.timeZone || (await markExpiredIfDue(handle.invitation.id))) {
    throw new NotFoundException()
  }
  return buildEventCalendar({
    uid: `${event.id}@mori.invitation`,
    sequence: event.calendarSequence,
    title: event.title,
    localStart: event.localStart,
    timeZone: event.timeZone,
  })
}
