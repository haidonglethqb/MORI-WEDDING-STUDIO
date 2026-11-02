import { z } from 'zod'

export const CatalogueQuerySchema = z
  .object({
    type: z.enum(['PAPER', 'DIGITAL']).optional(),
    shape: z.enum(['FLAT', 'BIFOLD']).optional(),
    style: z.string().trim().min(1).max(40).optional(),
  })
  .strict()

export type CatalogueQuery = z.infer<typeof CatalogueQuerySchema>

export const CatalogueVariantSchema = z.object({
  id: z.string().uuid(),
  shape: z.enum(['FLAT', 'BIFOLD', 'TRIFOLD']),
  availability: z.enum(['AVAILABLE', 'UNAVAILABLE', 'QUOTE_REQUIRED']),
  unitAmountVnd: z.string().nullable(),
})

export const CatalogueProductSchema = z.object({
  slug: z.string(),
  name: z.string(),
  type: z.enum(['PAPER', 'DIGITAL']),
  isFixture: z.boolean(),
  styleTags: z.array(z.string()),
  variants: z.array(CatalogueVariantSchema),
})

export type CatalogueProduct = z.infer<typeof CatalogueProductSchema>
