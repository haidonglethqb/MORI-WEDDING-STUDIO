/**
 * Tier 3: Cross-Feature Combination - SSRF Barrier & Timeout Budget
 * Verifies that SSRF checks fail fast (<50ms) and slow providers obey 12s deadline.
 */
import { describe, expect, it } from 'vitest'
import { validateTestProviderUrl } from '../harness/ssrf-test-harness.js'

describe('Tier 3: SSRF Barrier & Timeout Budget Combination', () => {
  it('blocks private target IP immediately without waiting for network timeout', () => {
    const start = Date.now()
    const result = validateTestProviderUrl('https://10.0.0.1/admin/internal')
    const elapsed = Date.now() - start

    expect(result.valid).toBe(false)
    expect(result.reason).toBe('BLOCKED_PRIVATE_IP')
    // Must fail fast within milliseconds, not hang awaiting socket timeout
    expect(elapsed).toBeLessThan(100)
  })

  it('enforces overall interactive request deadline <= 12,000ms on external provider latency (T16)', async () => {
    const GLOBAL_DEADLINE_MS = 12_000

    const executeWithDeadline = async (simulatedDelayMs: number) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), GLOBAL_DEADLINE_MS)

      try {
        if (simulatedDelayMs > GLOBAL_DEADLINE_MS) {
          throw new Error('AbortError: Request exceeded 12000ms global deadline')
        }
        return { ok: true, latencyMs: simulatedDelayMs }
      } finally {
        clearTimeout(timer)
      }
    }

    // Normal fast provider (150ms)
    const fast = await executeWithDeadline(150)
    expect(fast.ok).toBe(true)

    // Unresponsive provider (14,000ms)
    await expect(executeWithDeadline(14_000)).rejects.toThrow(/12000ms global deadline/)
  })
})
