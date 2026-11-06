/**
 * Tier 1: Feature 9, 10, 11 - Setup Fees, Quantity Tiers & Elimination of Fake Promo Copy
 * Authoritative: PROJECT.md F09/F10/F11, MORI_AI_V2_AGENT_HANDOFF.md AI-016, spec_report.md E13/E15
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 1: Setup Fees, Quantity Tiers & Fake Promo Elimination', () => {
  it('adds fixed setup fee accurately into merchandise subtotal (E15, T11)', () => {
    // Song Hy Bifold at 20 units (tier: 1..49, unit: 38k, setup: 500k)
    // 20 * 38,000 + 500,000 = 760,000 + 500,000 = 1,260,000 VND
    const estimate = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 20,
    })

    expect(estimate.merchandiseVnd).toBe('1260000')
    expect(estimate.totalVnd).toBeNull()
    expect(estimate.unresolved).toEqual(['shipping', 'tax'])
  })

  it('marks unpriced or bespoke variants with quoteRequired: true (E13, T12)', () => {
    const quoteEst = computeOracleEstimate({
      variantId: 'var-duyen-khoi-quote',
      quantity: 80,
    })

    expect(quoteEst.quoteRequired).toBe(true)
    expect(quoteEst.merchandiseVnd).toBeNull()
    expect(quoteEst.totalVnd).toBeNull()
    expect(quoteEst.unresolved).toEqual(['shipping', 'tax'])
  })

  it('eliminates fabricated promotional gift claims (1.200.000 ₫ RSVP gift, AI-016)', () => {
    const sanitizePromotionalClaims = (responseCopy: string) => {
      const forbiddenClaims = [
        /1\.200\.000\s*₫/i,
        /tặng kèm.*rsvp.*trị giá/i,
        /Master Pierre-Minh/i,
      ]
      return !forbiddenClaims.some((pattern) => pattern.test(responseCopy))
    }

    const legacyText = 'Tặng kèm trang thiệp cưới số RSVP đồng bộ nghệ thuật trị giá 1.200.000 ₫'
    expect(sanitizePromotionalClaims(legacyText)).toBe(false)

    const sanitizedText = 'Mẫu thiệp Song Hỷ Cung Đình có giá hàng tạm tính 2.740.000 ₫ cho 80 bộ.'
    expect(sanitizePromotionalClaims(sanitizedText)).toBe(true)
  })
})
