import { UnprocessableEntityException } from '@nestjs/common'
import { z } from 'zod'
import type { CataloguePreference } from '@mori/domain'
import type { AssistantChatRequest } from './assistant-types.js'

const AssistantChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
  sessionId: z.string().optional(),
  clientMessageId: z.string().uuid().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .optional(),
})

const EscalateRequestSchema = z.object({
  sessionId: z.string().trim().min(1).max(200).optional(),
  customerContact: z.string().trim().max(200).optional(),
  reason: z.string().trim().max(1000).optional(),
})

export function validateChatRequest(raw: unknown): AssistantChatRequest {
  const result = AssistantChatRequestSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new UnprocessableEntityException(
      issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid chat request',
    )
  }
  return result.data as AssistantChatRequest
}

export function validateEscalateRequest(raw: unknown) {
  const result = EscalateRequestSchema.safeParse(raw ?? {})
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new UnprocessableEntityException(
      issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid escalation request',
    )
  }
  return result.data
}

export interface AssistantBody {
  tool?: string
  productType?: 'PAPER' | 'DIGITAL' | null
  shape?: 'FLAT' | 'BIFOLD' | 'TRIFOLD' | null
  styles?: string[]
  colours?: string[]
  quantity?: number
  budgetVnd?: string | null
  budgetBasis?: 'TOTAL' | 'PER_CARD' | 'UNKNOWN'
}

export function parsePreference(body: AssistantBody): CataloguePreference {
  const quantity = body.quantity ?? 0
  const basis = body.budgetBasis
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new UnprocessableEntityException('Quantity must be between 1 and 500')
  }
  if (basis !== 'TOTAL' && basis !== 'PER_CARD' && basis !== 'UNKNOWN') {
    throw new UnprocessableEntityException('The budget needs a basis')
  }
  return {
    productType: body.productType ?? null,
    shape: body.shape ?? null,
    styles: (body.styles ?? []).slice(0, 8),
    colours: (body.colours ?? []).slice(0, 8),
    quantity,
    budgetVnd: body.budgetVnd ? BigInt(body.budgetVnd) : null,
    budgetBasis: basis,
  }
}
