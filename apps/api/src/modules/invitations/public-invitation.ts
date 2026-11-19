import { InvitationContentSchema, type PublicInvitation } from '@mori/contracts'

/** Allowlisted guest view. Owner ids and draft fields never leave this function. */
export function toPublicInvitation(slug: string, payload: unknown): PublicInvitation {
  const content = InvitationContentSchema.parse(payload)
  return {
    slug,
    displayNames: content.displayNames,
    eventTitle: content.eventTitle,
    greeting: content.greeting ?? null,
    ...(content.eventLocalStart ? { eventLocalStart: content.eventLocalStart } : {}),
    ...(content.timeZone ? { timeZone: content.timeZone } : {}),
    ...(content.templateId ? { templateId: content.templateId } : {}),
    ...(content.coupleRoles ? { coupleRoles: content.coupleRoles } : {}),
    ...(content.families ? { families: content.families } : {}),
    ...(content.lunarDate ? { lunarDate: content.lunarDate } : {}),
    ...(content.venueName ? { venueName: content.venueName } : {}),
    ...(content.venueAddress ? { venueAddress: content.venueAddress } : {}),
    ...(content.mapUrl ? { mapUrl: content.mapUrl } : {}),
    ...(content.scheduleItems ? { scheduleItems: content.scheduleItems } : {}),
    ...(content.photos ? { photos: content.photos } : {}),
    ...(content.templateConfig ? { templateConfig: content.templateConfig } : {}),
    ...(content.customDesign ? { customDesign: content.customDesign } : {}),
  }
}
