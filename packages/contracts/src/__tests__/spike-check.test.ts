import { describe, it, expect } from 'vitest'
import { CreateSpikeCheckRequestSchema } from '../spike-check.js'

describe('CreateSpikeCheckRequestSchema', () => {
  it('accepts valid note', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({ note: 'hello world' })
    expect(result.success).toBe(true)
  })

  it('rejects empty note', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({ note: '' })
    expect(result.success).toBe(false)
  })

  it('rejects note over 200 chars', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({ note: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects unknown keys (strict mode)', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({
      note: 'hello',
      extraField: 'should be rejected',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const hasUnrecognizedKey = result.error.issues.some(
        (i) => i.code === 'unrecognized_keys',
      )
      expect(hasUnrecognizedKey).toBe(true)
    }
  })

  it('accepts exactly 200 chars', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({ note: 'a'.repeat(200) })
    expect(result.success).toBe(true)
  })

  it('rejects missing note field', () => {
    const result = CreateSpikeCheckRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
