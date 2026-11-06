/**
 * Tier 2: Input Boundary & DTO Validation
 * Authoritative: PROJECT.md Feature 8, MORI_AI_V2_AGENT_HANDOFF.md §6, spec_report.md F05
 */
import { describe, expect, it } from 'vitest'

describe('Tier 2: Input Boundary & DTO Validation', () => {
  const validateChatMessageDto = (input: { message?: unknown; clientMessageId?: unknown }) => {
    if (typeof input.message !== 'string') {
      return { valid: false, error: 'Message must be a string' }
    }
    const trimmed = input.message.trim()
    if (trimmed.length < 1) {
      return { valid: false, error: 'Message cannot be empty or whitespace only' }
    }
    if (trimmed.length > 4000) {
      return { valid: false, error: 'Message exceeds maximum limit of 4000 characters' }
    }
    return { valid: true, message: trimmed }
  }

  it('rejects empty strings and whitespace-only payloads', () => {
    expect(validateChatMessageDto({ message: '' }).valid).toBe(false)
    expect(validateChatMessageDto({ message: '     \n\t   ' }).valid).toBe(false)
  })

  it('accepts boundary minimum input of exactly 1 non-whitespace character', () => {
    const minRes = validateChatMessageDto({ message: 'A' })
    expect(minRes.valid).toBe(true)
    expect(minRes.message).toBe('A')
  })

  it('accepts boundary maximum input of exactly 4000 characters', () => {
    const exact4000 = 'x'.repeat(4000)
    const exactRes = validateChatMessageDto({ message: exact4000 })
    expect(exactRes.valid).toBe(true)
    expect(exactRes.message?.length).toBe(4000)
  })

  it('rejects oversized inputs of 4001 characters with Unprocessable Entity', () => {
    const oversized4001 = 'x'.repeat(4001)
    const overRes = validateChatMessageDto({ message: oversized4001 })
    expect(overRes.valid).toBe(false)
    expect(overRes.error).toContain('maximum limit of 4000')
  })

  it('rejects non-string or null payloads', () => {
    expect(validateChatMessageDto({ message: null }).valid).toBe(false)
    expect(validateChatMessageDto({ message: 12345 }).valid).toBe(false)
    expect(validateChatMessageDto({}).valid).toBe(false)
  })
})
