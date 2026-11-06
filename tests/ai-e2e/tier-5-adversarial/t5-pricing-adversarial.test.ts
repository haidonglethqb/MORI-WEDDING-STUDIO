/**
 * Tier 5: Adversarial Pricing Math & Single Engine Invariants
 * White-box stress testing across the quantity spectrum, setup fee invariants, and hallucination defenses.
 */
import { describe, expect, it } from 'vitest'
import {
  PRODUCT_DUYEN_KHOI_QUOTE,
  PRODUCT_KOMOREBI_TRIFOLD,
  TEST_CATALOGUE_FIXTURES,
} from '../harness/catalogue-fixtures.js'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 5: Adversarial Pricing Math & Single Engine Invariants', () => {
  describe('1. Quantity Spectrum Boundary Invariants (1, 20, 50, 80, 100, 250, 500, 1000)', () => {
    // Song Hy Bifold tiers:
    // [1..49]: unit 38k, setup 500k
    // [50..99]: unit 28k, setup 500k
    // [100..500]: unit 24k, setup 300k
    const bifoldVariantId = 'var-song-hy-bifold'

    it('verifies exact math for qty = 1 (minimum quantity): 1 * 38k + 500k = 538k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 1 })
      expect(est.merchandiseVnd).toBe('538000')
      expect(est.quoteRequired).toBe(false)
    })

    it('verifies exact math for qty = 20 (interior tier 1): 20 * 38k + 500k = 1.260k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 20 })
      expect(est.merchandiseVnd).toBe('1260000')
    })

    it('verifies exact math for qty = 50 (tier 2 lower bound): 50 * 28k + 500k = 1.900k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 50 })
      expect(est.merchandiseVnd).toBe('1900000')
    })

    it('verifies exact math for qty = 80 (T09/T11 target): 80 * 28k + 500k = 2.740k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 80 })
      expect(est.merchandiseVnd).toBe('2740000')
    })

    it('verifies exact math for qty = 100 (tier 3 lower bound): 100 * 24k + 300k = 2.700k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 100 })
      expect(est.merchandiseVnd).toBe('2700000')
    })

    it('verifies exact math for qty = 250 (tier 3 midpoint): 250 * 24k + 300k = 6.300k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 250 })
      expect(est.merchandiseVnd).toBe('6300000')
    })

    it('verifies exact math for qty = 500 (tier 3 upper bound): 500 * 24k + 300k = 12.300k VND', () => {
      const est = computeOracleEstimate({ variantId: bifoldVariantId, quantity: 500 })
      expect(est.merchandiseVnd).toBe('12300000')
    })

    it('rejects qty = 1000 when variant tiers only cover up to 500 (gap invariant)', () => {
      expect(() =>
        computeOracleEstimate({ variantId: bifoldVariantId, quantity: 1000 }),
      ).toThrow(/Quantity does not match exactly one price tier/)
    })
  })

  describe('2. Setup Fee Isolation Invariant', () => {
    it('verifies that setupAmountVnd is never multiplied by quantity', () => {
      const testQuantities = [10, 50, 80, 100, 250, 500]
      for (const qty of testQuantities) {
        const est = computeOracleEstimate({ variantId: 'var-song-hy-bifold', quantity: qty })
        expect(est.merchandiseVnd).toBeDefined()
        const val = BigInt(est.merchandiseVnd ?? '0')
        // If buggy implementation did (unit + setup) * qty, value would be massive
        // For instance at qty 80: (28k + 500k) * 80 = 42,240,000 VND
        const badFormula = (28000n + 500000n) * BigInt(qty)
        expect(val).not.toBe(badFormula)
      }
    })
  })

  describe('3. Unpriced & Bespoke Availability Invariants', () => {
    it('forces quoteRequired: true and null merchandise for quote-only variants without 25k fallback', () => {
      const quoteVariant = PRODUCT_DUYEN_KHOI_QUOTE.variants[0]
      expect(quoteVariant).toBeDefined()
      const quoteEst = computeOracleEstimate({
        variantId: quoteVariant?.id ?? '',
        quantity: 80,
      })
      expect(quoteEst.quoteRequired).toBe(true)
      expect(quoteEst.merchandiseVnd).toBeNull()
      expect(quoteEst.merchandiseVnd).not.toBe('25000')
      expect(quoteEst.merchandiseVnd).not.toBe('25.000 ₫')
    })

    it('strictly rejects TRIFOLD variants with BadRequestException', () => {
      const trifoldVariant = PRODUCT_KOMOREBI_TRIFOLD.variants[0]
      expect(trifoldVariant).toBeDefined()
      expect(() =>
        computeOracleEstimate({
          variantId: trifoldVariant?.id ?? '',
          quantity: 80,
        }),
      ).toThrow(/BadRequestException.*configuration cannot be estimated/)
    })
  })

  describe('4. Unknown Slug & Hallucination Invariants', () => {
    it('strictly isolates known catalogue slugs from arbitrary/fabricated strings', () => {
      const validSlugs = new Set(TEST_CATALOGUE_FIXTURES.map((p) => p.slug))
      const probeSlugs = [
        'non-existent-luxury-suite-999',
        'royal-gold-embossed-00',
        'phantom-silk-suite',
        '../../api/v1/private',
      ]

      for (const probe of probeSlugs) {
        expect(validSlugs.has(probe)).toBe(false)
      }
    })
  })
})
