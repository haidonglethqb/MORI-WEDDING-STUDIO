import { z } from 'zod'

export const PlaceOrderSchema = z
  .object({
    requestId: z.string().uuid(),
    quoteId: z.string().uuid(),
    expectedVersion: z.number().int().nonnegative(),
    idempotencyKey: z.string().trim().min(1).max(200),
  })
  .strict()

export type PlaceOrder = z.infer<typeof PlaceOrderSchema>

export const IssueQuoteSchema = z
  .object({
    requestId: z.string().uuid(),
    totalAmountVnd: z.string().regex(/^\d+$/),
    shippingAmountVnd: z.string().regex(/^\d+$/),
    taxAmountVnd: z.string().regex(/^\d+$/),
    scopeFingerprint: z.string().trim().min(1).max(200),
    expiresAt: z.string().datetime(),
    isFixture: z.boolean(),
  })
  .strict()

export type IssueQuote = z.infer<typeof IssueQuoteSchema>
