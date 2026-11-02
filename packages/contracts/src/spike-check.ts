/**
 * Zod schemas for the spike-check resource.
 *
 * Unknown keys are rejected (strict mode) to verify the ZodValidationPipe
 * works correctly. Shared between NestJS (server validation) and
 * apps/web (TypeScript type-only import).
 */
import { z } from 'zod'

// ─── Request ─────────────────────────────────────────────────────────────────

export const CreateSpikeCheckRequestSchema = z
  .object({
    note: z
      .string()
      .min(1, 'note must not be empty')
      .max(200, 'note must be at most 200 characters'),
  })
  .strict() // reject unknown keys

export type CreateSpikeCheckRequest = z.infer<typeof CreateSpikeCheckRequestSchema>

// ─── Response ────────────────────────────────────────────────────────────────

export const SpikeCheckResponseSchema = z.object({
  id: z.string().uuid(),
  note: z.string(),
  createdAt: z.string().datetime(),
})

export type SpikeCheckResponse = z.infer<typeof SpikeCheckResponseSchema>
