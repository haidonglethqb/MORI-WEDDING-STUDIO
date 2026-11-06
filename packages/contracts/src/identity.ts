import { z } from 'zod'

export const RegisterRequestSchema = z
  .object({
    email: z.string().email().max(320),
    displayName: z.string().trim().min(1).max(80),
    password: z.string().min(15).max(128),
  })
  .strict()

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const LoginRequestSchema = z
  .object({
    email: z.string().email().max(320),
    password: z.string().min(1).max(128),
  })
  .strict()

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const CurrentUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(['CUSTOMER', 'STUDIO', 'ADMIN']),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'DISABLED']),
})

export type CurrentUser = z.infer<typeof CurrentUserSchema>

export const SESSION_COOKIE = '__Host-mori_session'
export const GUEST_COOKIE = '__Host-mori_guest'

export const EmailOnlyRequestSchema = z
  .object({
    email: z.string().email().max(320),
  })
  .strict()

export type EmailOnlyRequest = z.infer<typeof EmailOnlyRequestSchema>

export const TokenRequestSchema = z
  .object({
    token: z.string().min(20).max(200),
  })
  .strict()

export type TokenRequest = z.infer<typeof TokenRequestSchema>

export const ResetPasswordRequestSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(15).max(128),
  })
  .strict()

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>

export const EstimateRequestSchema = z
  .object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10_000),
  })
  .strict()

export type EstimateRequest = z.infer<typeof EstimateRequestSchema>

export const EstimateResponseSchema = z.object({
  currency: z.literal('VND'),
  isFixture: z.boolean().optional(),
  quantity: z.number().int(),
  merchandiseVnd: z.string().nullable(),
  shippingVnd: z.string().nullable(),
  taxVnd: z.string().nullable(),
  totalVnd: z.string().nullable(),
  unresolved: z.array(z.string()),
  quoteRequired: z.boolean(),
})

export type EstimateResponse = z.infer<typeof EstimateResponseSchema>
