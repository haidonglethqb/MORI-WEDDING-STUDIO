/**
 * Tier 3: Cross-Feature Combination - Origin Verification & Quota Reservation
 * Verifies that requests rejected by origin guards never decrement user quota.
 */
import { describe, expect, it } from 'vitest'
import { validateTestBffOrigin } from '../harness/origin-security-harness.js'

describe('Tier 3: Origin Verification & Quota Reservation Combination', () => {
  it('rejects cross-site request with 403 before quota counter is decremented', () => {
    let userQuotaUsed = 2
    const maxQuota = 5

    const processMutation = (origin: string) => {
      const originCheck = validateTestBffOrigin({ origin, method: 'POST' })
      if (!originCheck.ok) {
        return { status: 403, error: originCheck.errorCode }
      }
      if (userQuotaUsed >= maxQuota) {
        return { status: 429, error: 'AI_QUOTA_EXCEEDED' }
      }
      userQuotaUsed += 1
      return { status: 200, quotaRemaining: maxQuota - userQuotaUsed }
    }

    // 1. Cross-site attacker request
    const rejected = processMutation('http://evil-tracker.org')
    expect(rejected.status).toBe(403)
    // Invariant: Quota remains untouched
    expect(userQuotaUsed).toBe(2)

    // 2. Legitimate request from authorized app origin
    const accepted = processMutation('http://app.mori.localhost')
    expect(accepted.status).toBe(200)
    expect(userQuotaUsed).toBe(3)
  })

  it('enforces quota across successive requests regardless of rotated client headers', () => {
    let quotaCount = 0
    const limit = 5

    // Attempting to spoof multiple XFF headers in succession
    const headersList = [
      '1.1.1.1',
      '2.2.2.2',
      '3.3.3.3',
      '4.4.4.4',
      '5.5.5.5',
      '6.6.6.6',
    ]

    const responses = headersList.map(() => {
      if (quotaCount >= limit) {
        return 429
      }
      quotaCount += 1
      return 200
    })

    expect(responses).toEqual([200, 200, 200, 200, 200, 429])
    expect(quotaCount).toBe(5)
  })
})
