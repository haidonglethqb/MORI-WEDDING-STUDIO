import { z } from 'zod'

export const InvitationContentSchema = z
  .object({
    schemaVersion: z.literal(1),
    displayNames: z.tuple([
      z.string().trim().min(1).max(80),
      z.string().trim().min(1).max(80),
    ]),
    eventTitle: z.string().trim().min(1).max(120),
    greeting: z.string().trim().max(1000).optional(),
    coverAssetId: z.string().uuid().optional(),
    eventLocalStart: z.string().regex(/^\d{8}T\d{6}$/).optional(),
    timeZone: z.string().regex(/^[A-Za-z_]+(?:\/[A-Za-z_]+)+$/).optional(),
  })
  .strict()

export type InvitationContent = z.infer<typeof InvitationContentSchema>

export const SaveInvitationDraftSchema = z
  .object({
    expectedVersion: z.number().int().nonnegative(),
    content: InvitationContentSchema,
  })
  .strict()

export type SaveInvitationDraft = z.infer<typeof SaveInvitationDraftSchema>

export const PublishInvitationSchema = z
  .object({
    expectedVersion: z.number().int().nonnegative(),
  })
  .strict()

export type PublishInvitation = z.infer<typeof PublishInvitationSchema>

export const PublicInvitationSchema = z.object({
  slug: z.string(),
  displayNames: InvitationContentSchema.shape.displayNames,
  eventTitle: z.string(),
  greeting: z.string().nullable(),
})

export type PublicInvitation = z.infer<typeof PublicInvitationSchema>

export const GuestLinkExchangeSchema = z
  .object({
    secret: z.string().trim().min(43).max(128),
  })
  .strict()

export type GuestLinkExchange = z.infer<typeof GuestLinkExchangeSchema>

export const GatedInvitationSchema = z.object({
  gated: z.literal(true),
  slug: z.string(),
})

export type GatedInvitation = z.infer<typeof GatedInvitationSchema>
