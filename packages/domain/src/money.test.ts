import { describe, expect, it } from 'vitest'
import { formatVnd, parseVnd } from './money.js'

describe('parseVnd', () => {
  it('accepts an integer decimal string', () => {
    expect(parseVnd('2450000')).toBe(2450000n)
    expect(parseVnd('0')).toBe(0n)
  })

  it('rejects fractions, exponents, and signs', () => {
    expect(() => parseVnd('1.5')).toThrow(/integer decimal/)
    expect(() => parseVnd('1e2')).toThrow(/integer decimal/)
    expect(() => parseVnd('-1')).toThrow(/integer decimal/)
    expect(() => parseVnd('01')).toThrow(/integer decimal/)
  })

  it('rejects amounts above the maximum', () => {
    expect(() => parseVnd('1000000001')).toThrow(/maximum/)
  })
})

describe('formatVnd', () => {
  it('returns the decimal string', () => {
    expect(formatVnd(2450000n)).toBe('2450000')
  })
})
