/**
 * Tier 1: Feature 3 & 4 - Provider Endpoint SSRF Barrier
 * Authoritative: PROJECT.md F03, MORI_AI_V2_AGENT_HANDOFF.md AI-014, spec_report.md E04-E07
 */
import { describe, expect, it } from 'vitest'
import { validateTestProviderUrl } from '../harness/ssrf-test-harness.js'

describe('Tier 1: Provider Endpoint SSRF Barrier', () => {
  it('allows authorized HTTPS AI gateway endpoints', () => {
    const codex = validateTestProviderUrl('https://api.modelapi.vn/v1/chat/completions')
    expect(codex.valid).toBe(true)

    const groq = validateTestProviderUrl('https://api.groq.com/openai/v1/chat/completions')
    expect(groq.valid).toBe(true)

    const openai = validateTestProviderUrl('https://api.openai.com/v1')
    expect(openai.valid).toBe(true)
  })

  it('blocks cloud metadata endpoint 169.254.169.254 (E04)', () => {
    const awsMeta = validateTestProviderUrl('https://169.254.169.254/latest/meta-data/')
    expect(awsMeta.valid).toBe(false)
    expect(awsMeta.reason).toBe('BLOCKED_PRIVATE_IP')
  })

  it('blocks loopback endpoints localhost, 127.0.0.1, and ::1 (E05)', () => {
    const local = validateTestProviderUrl('https://localhost:5432')
    expect(local.valid).toBe(false)
    expect(local.reason).toBe('BLOCKED_PRIVATE_IP')

    const loopback = validateTestProviderUrl('https://127.0.0.1:4000/api')
    expect(loopback.valid).toBe(false)
    expect(loopback.reason).toBe('BLOCKED_PRIVATE_IP')
  })

  it('blocks plain HTTP protocol to prevent cleartext leakage (E06)', () => {
    const http = validateTestProviderUrl('http://api.modelapi.vn/v1')
    expect(http.valid).toBe(false)
    expect(http.reason).toBe('DISALLOWED_PROTOCOL')
  })

  it('blocks arbitrary non-allowlisted external hostnames', () => {
    const foreign = validateTestProviderUrl('https://evil-untrusted-api.com/v1')
    expect(foreign.valid).toBe(false)
    expect(foreign.reason).toBe('HOST_NOT_ALLOWLISTED')
  })
})
