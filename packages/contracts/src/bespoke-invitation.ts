import { z } from 'zod'

export const HexColorSchema = z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')

export const BespokeThemeSchema = z
  .object({
    bg: HexColorSchema,
    bgAccent: HexColorSchema.optional(),
    surface: HexColorSchema,
    text: HexColorSchema,
    muted: HexColorSchema,
    accent: HexColorSchema,
    border: HexColorSchema,
    buttonText: HexColorSchema,
  })
  .strict()

export type BespokeTheme = z.infer<typeof BespokeThemeSchema>

export const BespokeSectionKeySchema = z.enum([
  'hero',
  'couple-bio',
  'story',
  'families',
  'event-card',
  'dress-code',
  'gallery',
  'countdown',
  'gift-note',
])

export type BespokeSectionKey = z.infer<typeof BespokeSectionKeySchema>

export const BespokeMilestoneSchema = z
  .object({
    year: z.string().trim().min(1).max(30),
    title: z.string().trim().min(1).max(80),
    detail: z.string().trim().min(1).max(260),
  })
  .strict()

export const BespokeDesignBlueprintSchema = z
  .object({
    conceptName: z.string().trim().min(1).max(100),
    eyebrowTag: z.string().trim().max(80).optional(),
    typography: z.enum(['editorial-serif', 'modern-sans', 'romantic-italic', 'heritage-classic']),
    frameStyle: z.enum([
      'arch-dome',
      'sharp-magazine',
      'glass-card',
      'imperial-corner',
      'polaroid-mat',
      'soft-organic',
    ]),
    bgPattern: z.enum(['none', 'linen-grain', 'starry-dots', 'botanical-wash', 'gold-aura']),
    ornament: z.enum([
      'wax-seal',
      'botanical-branch',
      'double-happiness',
      'constellation',
      'minimal-line',
      'zen-enso',
    ]),
    heroLayout: z.enum(['arch-portrait', 'full-overlay', 'split-editorial', 'polaroid-story']),
    theme: BespokeThemeSchema,
    sectionOrder: z.array(BespokeSectionKeySchema).min(2).max(9),
    coupleBio: z
      .object({
        groomMeta: z.string().trim().max(120).optional(),
        brideMeta: z.string().trim().max(120).optional(),
      })
      .strict()
      .optional(),
    storyMilestones: z.array(BespokeMilestoneSchema).max(4).optional(),
    dressCode: z
      .object({
        title: z.string().trim().max(80).optional(),
        note: z.string().trim().max(220).optional(),
        swatches: z.array(HexColorSchema).max(5),
      })
      .strict()
      .optional(),
    giftNote: z
      .object({
        heading: z.string().trim().max(80).optional(),
        message: z.string().trim().max(260).optional(),
      })
      .strict()
      .optional(),
    customHtml: z.string().max(28_000).optional(),
    customCss: z.string().max(18_000).optional(),
  })
  .strict()

export type BespokeDesignBlueprint = z.infer<typeof BespokeDesignBlueprintSchema>
