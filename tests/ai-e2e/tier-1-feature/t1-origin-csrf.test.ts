/**
 * Tier 1: Feature 5 & 6 - Multi-Origin BFF Mutation Guard & CSRF Fail-Closed
 * Authoritative: PROJECT.md F02, MORI_AI_V2_AGENT_HANDOFF.md AI-013, AGENTS.md rule #7
 */
import { describe, expect, it } from 'vitest'
import { validateTestBffOrigin } from '../harness/origin-security-harness.js'

describe('Tier 1: Multi-Origin BFF Mutation Guard & CSRF Fail-Closed', () => {
  it('allows authorized configured origins in development and production', () => {
    const devRes = validateTestBffOrigin({
      origin: 'http://app.mori.localhost',
      method: 'POST',
    })
    expect(devRes.ok).toBe(true)
    expect(devRes.upstreamOrigin).toBe('http://app.mori.localhost')

    const inviteRes = validateTestBffOrigin({
      origin: 'http://invite.mori.localhost',
      method: 'POST',
    })
    expect(inviteRes.ok).toBe(true)

    const localhostRes = validateTestBffOrigin({
      origin: 'http://localhost:3000',
      method: 'POST',
    })
    expect(localhostRes.ok).toBe(true)
    expect(localhostRes.upstreamOrigin).toBe('http://app.mori.localhost')
  })

  it('rejects foreign cross-site origins with 403 Forbidden', () => {
    const evilRes = validateTestBffOrigin({
      origin: 'http://evil-attacker-site.com',
      method: 'POST',
    })
    expect(evilRes.ok).toBe(false)
    expect(evilRes.status).toBe(403)
    expect(evilRes.errorCode).toBe('CROSS_SITE_REJECTED')
  })

  it('fails closed on browser mutations missing both Origin and Referer', () => {
    const missingRes = validateTestBffOrigin({
      origin: null,
      referer: null,
      method: 'POST',
    })
    expect(missingRes.ok).toBe(false)
    expect(missingRes.status).toBe(403)
    expect(missingRes.errorCode).toBe('CROSS_SITE_REJECTED')
  })

  it('rejects modern browsers sending Sec-Fetch-Site: cross-site', () => {
    const sfsRes = validateTestBffOrigin({
      origin: 'http://app.mori.localhost',
      secFetchSite: 'cross-site',
      method: 'POST',
    })
    expect(sfsRes.ok).toBe(false)
    expect(sfsRes.status).toBe(403)
    expect(sfsRes.errorCode).toBe('CROSS_SITE_REJECTED')
  })
})
