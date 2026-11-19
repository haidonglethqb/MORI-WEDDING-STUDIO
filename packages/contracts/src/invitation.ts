import { z } from 'zod'
import { BespokeDesignBlueprintSchema } from './bespoke-invitation.js'

export const InvitationTemplateIdSchema = z.enum([
  'editorial-vogue',
  'heritage-palace',
  'botanical-zen',
  'custom-ai',
])

export type InvitationTemplateId = z.infer<typeof InvitationTemplateIdSchema>

const safePhotoRef = z
  .string()
  .trim()
  .min(1)
  .max(60_000)
  .refine(
    (v) =>
      v.startsWith('/images/') ||
      v.startsWith('https://') ||
      v.startsWith('http://') ||
      /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
    'Invalid image reference',
  )

const safeMapUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || v.startsWith('https://') || v.startsWith('http://'), 'Invalid map URL')

export const InvitationFamiliesSchema = z
  .object({
    groomParents: z.string().trim().max(160).optional(),
    groomOrigin: z.string().trim().max(120).optional(),
    brideParents: z.string().trim().max(160).optional(),
    brideOrigin: z.string().trim().max(120).optional(),
  })
  .strict()

export type InvitationFamilies = z.infer<typeof InvitationFamiliesSchema>

export const InvitationScheduleItemSchema = z
  .object({
    time: z.string().trim().max(20),
    label: z.string().trim().max(80),
  })
  .strict()

export type InvitationScheduleItem = z.infer<typeof InvitationScheduleItemSchema>

export const InvitationPhotosSchema = z
  .object({
    heroUrl: safePhotoRef.optional(),
    galleryUrls: z.array(safePhotoRef).max(4).optional(),
    storyCaption: z.string().trim().max(500).optional(),
  })
  .strict()

export type InvitationPhotos = z.infer<typeof InvitationPhotosSchema>

export const InvitationTemplateConfigSchema = z
  .object({
    paletteId: z.string().trim().max(40).optional(),
    frameStyle: z.string().trim().max(40).optional(),
    motifStyle: z.string().trim().max(40).optional(),
    showFamilies: z.boolean().optional(),
    showLunarDate: z.boolean().optional(),
    showGallery: z.boolean().optional(),
    showSchedule: z.boolean().optional(),
    showCountdown: z.boolean().optional(),
    showMapButton: z.boolean().optional(),
    showAudio: z.boolean().optional(),
  })
  .strict()

export type InvitationTemplateConfig = z.infer<typeof InvitationTemplateConfigSchema>

const optionalContentFields = {
  templateId: InvitationTemplateIdSchema.optional(),
  coupleRoles: z.tuple([z.string().trim().max(60), z.string().trim().max(60)]).optional(),
  families: InvitationFamiliesSchema.optional(),
  lunarDate: z.string().trim().max(120).optional(),
  venueName: z.string().trim().max(160).optional(),
  venueAddress: z.string().trim().max(240).optional(),
  mapUrl: safeMapUrl.optional(),
  scheduleItems: z.array(InvitationScheduleItemSchema).max(6).optional(),
  photos: InvitationPhotosSchema.optional(),
  templateConfig: InvitationTemplateConfigSchema.optional(),
  customDesign: BespokeDesignBlueprintSchema.optional(),
}

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
    ...optionalContentFields,
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
  eventLocalStart: InvitationContentSchema.shape.eventLocalStart,
  timeZone: InvitationContentSchema.shape.timeZone,
  ...optionalContentFields,
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
