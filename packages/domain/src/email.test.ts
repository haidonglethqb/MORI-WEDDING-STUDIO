import { describe, expect, it } from 'vitest'
import { normalizeEmail } from './email.js'

describe('normalizeEmail', () => {
  it('treats case and surrounding space as the same address', () => {
    expect(normalizeEmail('  Mai@Example.COM ')).toBe('mai@example.com')
  })

  it('applies NFKC so compatibility characters match', () => {
    expect(normalizeEmail('mai@\uFF25xample.com')).toBe('mai@example.com')
  })
})
