/**
 * RFC 9457 Problem Details schema (spec section 11.5).
 *
 * Returned by the API on all error responses. The `violations` array is
 * included for validation errors (HTTP 422).
 */
import { z } from 'zod'

export const ViolationSchema = z.object({
  field: z.string(),
  message: z.string(),
})

export const ProblemDetailsSchema = z.object({
  type: z.string().url().describe('A URI reference that identifies the problem type'),
  title: z.string().describe('Short, human-readable summary of the problem'),
  status: z.number().int().describe('HTTP status code'),
  detail: z.string().optional().describe('Human-readable explanation specific to this occurrence'),
  instance: z.string().optional().describe('A URI reference to this specific occurrence'),
  violations: z.array(ViolationSchema).optional().describe('Validation violation list'),
})

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>
export type Violation = z.infer<typeof ViolationSchema>

export const PROBLEM_TYPES = {
  VALIDATION: 'https://mori.app/errors/validation',
  NOT_FOUND: 'https://mori.app/errors/not-found',
  INTERNAL: 'https://mori.app/errors/internal',
  CONFLICT: 'https://mori.app/errors/conflict',
  RATE_LIMITED: 'https://mori.app/errors/rate-limited',
  SERVICE_UNAVAILABLE: 'https://mori.app/errors/service-unavailable',
} as const
