/**
 * Adversarial Pricing Math & Invariant Stress Suite (Milestone 2 / PR-01)
 * Validates 100% parity between AiPricingTool and EstimateService across quantity spectrum.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { disconnectPrismaClient, getPrismaClient } from '@mori/database'
import { EstimateService } from '../pricing/estimate.service.js'
import { AiPricingTool } from './ai-pricing-tool.js'

describe('Adversarial Stress Test: Pricing Tool vs EstimateService Parity', () => {
  const prisma = getPrismaClient()
  const estimateService = new EstimateService()
  const pricingTool = new AiPricingTool(estimateService)
  const testId = `stress-pricing-${Date.now()}`
  let variantId = ''
  let unpricedVariantId = ''
  let quoteOnlyVariantId = ''
  let trifoldVariantId = ''

  const SPECTRUM_TIERS = [
    { min: 1, max: 20, unit: 45_000n, setup: 200_000n },
    { min: 21, max: 50, unit: 40_000n, setup: 250_000n },
    { min: 51, max: 80, unit: 35_000n, setup: 300_000n },
    { min: 81, max: 100, unit: 30_000n, setup: 350_000n },
    { min: 101, max: 250, unit: 25_000n, setup: 400_000n },
    { min: 251, max: 500, unit: 20_000n, setup: 450_000n },
    { min: 501, max: 1000, unit: 18_000n, setup: 500_000n },
  ]

  beforeAll(async () => {
    const product = await prisma.product.create({
      data: {
        slug: testId,
        name: 'Stress Test Suite',
        description: 'Adversarial pricing stress test product',
        type: 'PAPER',
        state: 'ACTIVE',
        isFixture: true,
        styleTags: ['modern'],
        colourTags: ['gold'],
        variants: {
          create: [
            { shape: 'FLAT', availability: 'AVAILABLE' },
            { shape: 'FLAT', availability: 'AVAILABLE' }, // unpriced
            { shape: 'FLAT', availability: 'QUOTE_REQUIRED' },
            { shape: 'TRIFOLD', availability: 'AVAILABLE' },
          ],
        },
      },
      include: { variants: true },
    })

    const variants = product.variants
    variantId = variants[0]?.id ?? ''
    unpricedVariantId = variants[1]?.id ?? ''
    quoteOnlyVariantId = variants[2]?.id ?? ''
    trifoldVariantId = variants[3]?.id ?? ''

    await prisma.priceBook.create({
      data: {
        versionLabel: testId,
        state: 'PUBLISHED',
        isFixture: true,
        rules: {
          create: SPECTRUM_TIERS.map((t) => ({
            variantId,
            quantityMin: t.min,
            quantityMax: t.max,
            unitAmountVnd: t.unit,
            setupAmountVnd: t.setup,
          })),
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.priceRule.deleteMany({ where: { priceBook: { versionLabel: testId } } })
    await prisma.priceBook.deleteMany({ where: { versionLabel: testId } })
    await prisma.productVariant.deleteMany({ where: { product: { slug: testId } } })
    await prisma.product.deleteMany({ where: { slug: testId } })
    await disconnectPrismaClient()
  })

  const testQuantities = [1, 20, 50, 80, 100, 250, 500, 1000]

  testQuantities.forEach((qty) => {
    it(`guarantees 100% price match for quantity = ${qty} between AiPricingTool and EstimateService`, async () => {
      const canonicalEstimate = await estimateService.estimate({ variantId, quantity: qty })
      const toolEstimate = await pricingTool.calculateEstimate({ variantId, quantity: qty })

      expect(toolEstimate.success).toBe(true)
      expect(toolEstimate.status).toBe('OK')
      expect(toolEstimate.quoteRequired).toBe(false)
      expect(toolEstimate.merchandiseVnd).toBe(canonicalEstimate.merchandiseVnd)
      expect(toolEstimate.currency).toBe(canonicalEstimate.currency)
      expect(toolEstimate.unresolved).toEqual(canonicalEstimate.unresolved)

      // Invariant check: merchandise = unit * qty + setup
      const tier = SPECTRUM_TIERS.find((t) => qty >= t.min && qty <= t.max)
      expect(tier).toBeDefined()
      if (!tier) throw new Error(`Missing tier for quantity ${qty}`)

      const expectedMerchandise = tier.unit * BigInt(qty) + tier.setup
      expect(toolEstimate.merchandiseVnd).toBe(expectedMerchandise.toString())

      // Negative check: setup fee is NEVER multiplied by quantity
      const erroneousMultiplier = (tier.unit + tier.setup) * BigInt(qty)
      if (qty > 1) {
        expect(toolEstimate.merchandiseVnd).not.toBe(erroneousMultiplier.toString())
      }
    })
  })

  it('correctly returns quoteRequired: true and null merchandise for unpriced variant without 25k fallback', async () => {
    const unpricedRes = await pricingTool.calculateEstimate({ variantId: unpricedVariantId, quantity: 80 })
    expect(unpricedRes.success).toBe(false)
    expect(unpricedRes.quoteRequired).toBe(true)
    expect(unpricedRes.merchandiseVnd).toBeNull()
    expect(unpricedRes.status).toBe('TIER_MISMATCH')
    expect(unpricedRes.merchandiseVnd).not.toBe('25000')
    expect(unpricedRes.merchandiseVnd).not.toBe('25.000 ₫')
  })

  it('correctly returns quoteRequired: true for explicit QUOTE_REQUIRED variant', async () => {
    const quoteRes = await pricingTool.calculateEstimate({ variantId: quoteOnlyVariantId, quantity: 100 })
    expect(quoteRes.success).toBe(true)
    expect(quoteRes.quoteRequired).toBe(true)
    expect(quoteRes.status).toBe('QUOTE_REQUIRED')
    expect(quoteRes.merchandiseVnd).toBeNull()
  })

  it('rejects TRIFOLD configurations with UNAVAILABLE status', async () => {
    const trifoldRes = await pricingTool.calculateEstimate({ variantId: trifoldVariantId, quantity: 50 })
    expect(trifoldRes.success).toBe(false)
    expect(trifoldRes.status).toBe('UNAVAILABLE')
    expect(trifoldRes.isAvailable).toBe(false)
    expect(trifoldRes.merchandiseVnd).toBeNull()
  })

  it('handles quantity gap (qty = 1500 > max tier 1000) with TIER_MISMATCH and null merchandise', async () => {
    const outOfTierRes = await pricingTool.calculateEstimate({ variantId, quantity: 1500 })
    expect(outOfTierRes.success).toBe(false)
    expect(outOfTierRes.status).toBe('TIER_MISMATCH')
    expect(outOfTierRes.quoteRequired).toBe(true)
    expect(outOfTierRes.merchandiseVnd).toBeNull()
  })
})
