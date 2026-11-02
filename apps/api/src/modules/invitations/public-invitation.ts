import { InvitationContentSchema, type PublicInvitation } from '@mori/contracts'

/** Allowlisted guest view. Owner ids and draft fields never leave this function. */
export function toPublicInvitation(slug: string, payload: unknown): PublicInvitation {
  const content = InvitationContentSchema.parse(payload)
  return {
    slug,
    displayNames: content.displayNames,
    eventTitle: content.eventTitle,
    greeting: content.greeting ?? null,
  }
}
