import { describe, expect, it } from 'vitest'
import { SECURITY_HEADERS } from './security-headers.js'

describe('API security headers', () => {
  it('blocks framing, sniffing, and referrer leakage without unsafe script sources', () => {
    const headers = Object.fromEntries(SECURITY_HEADERS)
    expect(headers['Referrer-Policy']).toBe('no-referrer')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['Permissions-Policy']).toContain('camera=()')
    expect(headers['Content-Security-Policy']).not.toContain('unsafe-eval')
    expect(headers['Content-Security-Policy']).not.toContain('unsafe-inline')
    expect(headers['Strict-Transport-Security']).toBeUndefined()
  })
})
