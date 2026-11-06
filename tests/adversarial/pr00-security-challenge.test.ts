import { describe, expect, it } from 'vitest'
import {
  AiSsrfValidator,
  isPrivateOrReservedIp,
} from '../../apps/api/src/modules/assistance/ai-ssrf-validator.js'
import {
  AiConfigService,
} from '../../apps/api/src/modules/assistance/ai-config.service.js'
import {
  AiProviderTesterService,
} from '../../apps/api/src/modules/assistance/ai-provider-tester.service.js'
import { validateBffOrigin } from '../../apps/web/src/lib/safe-mutation-origin.js'
import {
  assertMutationOrigin,
  getAllowedAppOrigins,
} from '../../apps/api/src/common/origin-guard.js'

describe('Adversarial Security Challenge: Milestone 1 (PR-00)', () => {
  const mockConfigService = {
    getConfig: () => ({
      provider: 'CODEX' as const,
      codexApiKey: 'test-codex-key',
      codexBaseUrl: 'https://api.modelapi.vn/v1',
      codexPrimaryModel: 'gpt-6.1-sol',
      groqApiKey: 'test-groq-key',
      groqBaseUrl: 'https://api.groq.com/openai/v1',
      groqPrimaryModel: 'openai/gpt-oss-120b',
    }),
  }
  const tester = new AiProviderTesterService(
    mockConfigService as unknown as AiConfigService,
  )

  describe('1. SSRF Stress Testing: Cloud Metadata & Private Networks', () => {
    const maliciousUrls = [
      // Cloud Metadata
      { url: 'http://169.254.169.254', desc: 'AWS/GCP metadata IPv4 (HTTP)' },
      { url: 'https://169.254.169.254', desc: 'AWS/GCP metadata IPv4 (HTTPS)' },
      { url: 'http://169.254.169.254/latest/meta-data/', desc: 'AWS metadata path' },
      { url: 'http://metadata.google.internal', desc: 'GCP metadata internal hostname (HTTP)' },
      { url: 'https://metadata.google.internal', desc: 'GCP metadata internal hostname (HTTPS)' },
      { url: 'http://169.254.1.1', desc: 'Link-local IP range (HTTP)' },
      { url: 'https://169.254.255.255', desc: 'Link-local IP boundary (HTTPS)' },

      // Private Networks (RFC 1918 & CGNAT)
      { url: 'http://10.0.0.1', desc: 'RFC 1918 Class A 10.0.0.1' },
      { url: 'https://10.0.0.1', desc: 'RFC 1918 Class A 10.0.0.1 (HTTPS)' },
      { url: 'http://10.255.255.255', desc: 'RFC 1918 Class A broadcast' },
      { url: 'http://192.168.1.1', desc: 'RFC 1918 Class C 192.168.1.1' },
      { url: 'https://192.168.1.1', desc: 'RFC 1918 Class C 192.168.1.1 (HTTPS)' },
      { url: 'http://172.16.0.1', desc: 'RFC 1918 Class B lower bound' },
      { url: 'https://172.16.0.1', desc: 'RFC 1918 Class B lower bound (HTTPS)' },
      { url: 'http://172.31.255.255', desc: 'RFC 1918 Class B upper bound' },
      { url: 'http://100.64.0.1', desc: 'Carrier-Grade NAT lower bound' },
      { url: 'https://100.127.255.254', desc: 'Carrier-Grade NAT upper bound' },

      // Loopback
      { url: 'http://127.0.0.1:5432', desc: 'Loopback Postgres port' },
      { url: 'https://127.0.0.1:5432', desc: 'Loopback HTTPS Postgres port' },
      { url: 'http://127.0.0.1', desc: 'Loopback standard' },
      { url: 'http://localhost', desc: 'Localhost standard' },
      { url: 'https://localhost', desc: 'Localhost HTTPS' },
      { url: 'http://localhost:3000', desc: 'Localhost port 3000' },
      { url: 'http://[::1]', desc: 'IPv6 loopback' },
      { url: 'https://[::1]', desc: 'IPv6 loopback HTTPS' },
      { url: 'http://[::1]:8080', desc: 'IPv6 loopback with port' },
      { url: 'http://0.0.0.0', desc: '0.0.0.0 wildcard' },
      { url: 'https://0.0.0.0', desc: '0.0.0.0 wildcard HTTPS' },

      // Non-HTTPS Schemes
      { url: 'http://api.modelapi.vn', desc: 'Plain HTTP allowlisted domain' },
      { url: 'http://api.openai.com', desc: 'Plain HTTP OpenAI' },
      { url: 'http://api.groq.com', desc: 'Plain HTTP Groq' },
      { url: 'ftp://api.modelapi.vn', desc: 'FTP scheme' },
      { url: 'file:///etc/passwd', desc: 'File scheme Linux' },
      { url: 'file:///C:/Windows/win.ini', desc: 'File scheme Windows' },
      { url: 'gopher://127.0.0.1:6379', desc: 'Gopher scheme redis exploitation' },
      { url: 'javascript:alert(1)', desc: 'Javascript pseudo-scheme' },

      // Unallowlisted External Domains
      { url: 'https://evil-attacker.com', desc: 'External attacker domain' },
      { url: 'https://evil.corp', desc: 'External corporate domain' },
      { url: 'https://google.com', desc: 'External legitimate domain not in allowlist' },
      { url: 'https://api.openai.com.attacker.com', desc: 'Subdomain spoofing attacker.com' },

      // Userinfo Spoofing Attempt (connecting to attacker with fake userinfo)
      { url: 'https://api.openai.com@evil-attacker.com', desc: 'Userinfo domain deception' },
    ]

    for (const target of maliciousUrls) {
      it(`AiSsrfValidator rejects: ${target.desc} (${target.url})`, async () => {
        const result = await AiSsrfValidator.validateTargetUrl(target.url)
        expect(result.valid).toBe(false)
        expect(result.reason).toBeDefined()
      })

      it(`AiProviderTesterService blocks probe for: ${target.desc} (${target.url})`, async () => {
        const result = await tester.testConnection({
          provider: 'CODEX',
          baseUrl: target.url,
          apiKey: 'test-key',
          model: 'gpt-6.1-sol',
        })
        expect(result.ok).toBe(false)
        expect(result.error).toMatch(/SSRF validation failed/i)
      })
    }

    it('safely handles userinfo embedded in allowed host URLs', async () => {
      // https://user:pass@api.openai.com/v1 - WHATWG fetch specification rejects credentials in request URLs
      const result = await tester.testConnection({
        provider: 'CODEX',
        baseUrl: 'https://evil-attacker.com@api.openai.com',
        apiKey: 'test-key',
        model: 'gpt-6.1-sol',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/credentials|SSRF/i)
    })

    it('rejects invalid model name parameter injection in AiProviderTesterService', async () => {
      const badModelResult = await tester.testConnection({
        provider: 'CODEX',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-key',
        model: 'model; rm -rf /; echo',
      })
      expect(badModelResult.ok).toBe(false)
      expect(badModelResult.error).toContain('Tên model không hợp lệ')
    })
  })

  describe('2. IP Range Classification Rigor', () => {
    it('exhaustively identifies all reserved, loopback, private and cloud metadata IPs', () => {
      // Loopback IPv4 & IPv6
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('127.0.0.2')).toBe(true)
      expect(isPrivateOrReservedIp('127.255.255.255')).toBe(true)
      expect(isPrivateOrReservedIp('0.0.0.0')).toBe(true)
      expect(isPrivateOrReservedIp('::1')).toBe(true)
      expect(isPrivateOrReservedIp('::')).toBe(true)

      // Cloud Metadata & Link Local (169.254.0.0/16)
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true)
      expect(isPrivateOrReservedIp('169.254.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('169.254.255.254')).toBe(true)

      // RFC 1918 Private
      expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('10.254.254.254')).toBe(true)
      expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('172.25.10.1')).toBe(true)
      expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true)
      expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false) // Public
      expect(isPrivateOrReservedIp('192.168.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('192.168.255.255')).toBe(true)
      expect(isPrivateOrReservedIp('192.169.0.1')).toBe(false) // Public

      // CGNAT (100.64.0.0/10: 100.64.0.0 - 100.127.255.255)
      expect(isPrivateOrReservedIp('100.64.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('100.127.255.255')).toBe(true)
      expect(isPrivateOrReservedIp('100.63.255.255')).toBe(false) // Public
      expect(isPrivateOrReservedIp('100.128.0.0')).toBe(false) // Public

      // Multicast & Reserved (>= 224.0.0.0)
      expect(isPrivateOrReservedIp('224.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('239.255.255.255')).toBe(true)
      expect(isPrivateOrReservedIp('240.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('255.255.255.255')).toBe(true)

      // IPv6 unique-local (fc00::/7) and link-local (fe80::/10)
      expect(isPrivateOrReservedIp('fc00::1')).toBe(true)
      expect(isPrivateOrReservedIp('fd00::1')).toBe(true)
      expect(isPrivateOrReservedIp('fe80::1')).toBe(true)

      // IPv4-mapped IPv6
      expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('::ffff:169.254.169.254')).toBe(true)
      expect(isPrivateOrReservedIp('::ffff:10.0.0.1')).toBe(true)
      expect(isPrivateOrReservedIp('::ffff:8.8.8.8')).toBe(false)

      // Genuine public IPs
      expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false)
      expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false)
      expect(isPrivateOrReservedIp('142.250.190.46')).toBe(false)
    })
  })

  describe('3. Origin & CSRF Challenge: safe-mutation-origin.ts', () => {
    it('rejects modern browsers sending sec-fetch-site: cross-site with 403', () => {
      const request = new Request('http://app.mori.localhost/api/test', {
        method: 'POST',
        headers: {
          'sec-fetch-site': 'cross-site',
          origin: 'http://app.mori.localhost',
        },
      })
      const result = validateBffOrigin(request)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(403)
      }
    })

    it('fails closed with 403 when both Origin and Referer are missing', () => {
      const request = new Request('http://app.mori.localhost/api/test', {
        method: 'POST',
      })
      const result = validateBffOrigin(request)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(403)
      }
    })

    it('rejects spoofed foreign origins with 403', () => {
      const spoofedOrigins = [
        'http://evil.com',
        'https://evil.com',
        'http://app.mori.localhost.evil.com',
        'http://evil.app.mori.localhost',
        'http://app.mori.localhost:8080',
        'https://app.mori.localhost',
        'null',
      ]

      for (const origin of spoofedOrigins) {
        const request = new Request('http://app.mori.localhost/api/test', {
          method: 'POST',
          headers: { origin },
        })
        const result = validateBffOrigin(request)
        expect(result.ok, `Origin ${origin} should be rejected`).toBe(false)
        if (!result.ok) {
          expect(result.response.status).toBe(403)
        }
      }
    })

    it('rejects spoofed or malformed Referer headers with 403', () => {
      const badReferers = [
        'http://evil.com?ref=http://app.mori.localhost',
        'http://evil.com/http://app.mori.localhost',
        'not-a-valid-url',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      ]

      for (const referer of badReferers) {
        const request = new Request('http://app.mori.localhost/api/test', {
          method: 'POST',
          headers: { referer },
        })
        const result = validateBffOrigin(request)
        expect(result.ok, `Referer ${referer} should be rejected`).toBe(false)
        if (!result.ok) {
          expect(result.response.status).toBe(403)
        }
      }
    })

    it('accepts legitimate configured origins', () => {
      const validOrigins = [
        'http://app.mori.localhost',
        'http://invite.mori.localhost',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ]

      for (const origin of validOrigins) {
        const request = new Request('http://app.mori.localhost/api/test', {
          method: 'POST',
          headers: { origin },
        })
        const result = validateBffOrigin(request)
        expect(result.ok, `Origin ${origin} should be accepted`).toBe(true)
        if (result.ok) {
          expect(result.upstreamOrigin).toBeDefined()
        }
      }
    })

    it('accepts legitimate Referer headers from configured origins', () => {
      const request = new Request('http://app.mori.localhost/api/test', {
        method: 'POST',
        headers: { referer: 'http://app.mori.localhost/admin/ai-config' },
      })
      const result = validateBffOrigin(request)
      expect(result.ok).toBe(true)
    })
  })

  describe('4. NestJS OriginGuard: assertMutationOrigin', () => {
    it('throws ForbiddenException (403) for undefined, empty, or unallowed origins', () => {
      expect(() => assertMutationOrigin(undefined)).toThrowError(/refused|CROSS_SITE_REJECTED/i)
      expect(() => assertMutationOrigin('')).toThrowError(/refused|CROSS_SITE_REJECTED/i)
      expect(() => assertMutationOrigin('http://evil.com')).toThrowError(/refused|CROSS_SITE_REJECTED/i)
      expect(() => assertMutationOrigin('http://attacker.com')).toThrowError(/refused|CROSS_SITE_REJECTED/i)
    })

    it('permits authorized app origins', () => {
      const allowed = getAllowedAppOrigins()
      for (const origin of allowed) {
        expect(() => assertMutationOrigin(origin, allowed)).not.toThrow()
      }
    })
  })
})
