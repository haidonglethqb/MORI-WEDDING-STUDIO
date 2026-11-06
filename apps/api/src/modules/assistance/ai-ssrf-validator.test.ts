import { describe, expect, it } from 'vitest'
import { AiSsrfValidator, isPrivateOrReservedIp } from './ai-ssrf-validator.js'

describe('AiSsrfValidator', () => {
  it('identifies private, loopback, and reserved IP addresses accurately', () => {
    // Loopback
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true)
    expect(isPrivateOrReservedIp('127.255.255.255')).toBe(true)
    expect(isPrivateOrReservedIp('::1')).toBe(true)

    // RFC 1918 private
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true)
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true)
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true)
    expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false)
    expect(isPrivateOrReservedIp('192.168.1.100')).toBe(true)

    // Link-local and cloud metadata
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true)
    expect(isPrivateOrReservedIp('169.254.1.1')).toBe(true)

    // Carrier-grade NAT (100.64.0.0/10)
    expect(isPrivateOrReservedIp('100.64.0.1')).toBe(true)
    expect(isPrivateOrReservedIp('100.127.255.254')).toBe(true)
    expect(isPrivateOrReservedIp('100.128.0.1')).toBe(false)

    // IPv6 unique local & link-local
    expect(isPrivateOrReservedIp('fc00::1')).toBe(true)
    expect(isPrivateOrReservedIp('fd12:3456:789a::1')).toBe(true)
    expect(isPrivateOrReservedIp('fe80::1')).toBe(true)

    // Public IPs
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false)
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false)
  })

  it('rejects non-HTTPS URLs', async () => {
    const res = await AiSsrfValidator.validateTargetUrl('http://api.modelapi.vn/v1')
    expect(res.valid).toBe(false)
    expect(res.reason).toContain('HTTPS')
  })

  it('rejects disallowed hostnames', async () => {
    const res = await AiSsrfValidator.validateTargetUrl('https://evil.corp/v1')
    expect(res.valid).toBe(false)
    expect(res.reason).toContain('not in the allowed AI hosts list')
  })

  it('allows valid HTTPS allowlisted providers', async () => {
    const res = await AiSsrfValidator.validateTargetUrl('https://api.openai.com/v1')
    expect(res.valid).toBe(true)
    expect(res.resolvedIp).toBeDefined()
  })
})
