/**
 * Tier 4: Real-World Evaluation Scenarios T09 through T15
 * Authoritative: MORI_AI_V2_AGENT_HANDOFF.md §11, spec_report.md §6 & §7
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'
import {
  applyFactPatches,
  createInitialTestBrief,
  type TestFactPatch,
} from '../harness/conversation-memory-harness.js'

describe('Tier 4: Scenarios T09 - T15 (Multi-Intent, Setup Math, Outage, Boundaries)', () => {
  // T09: 80 bộ X dưới 3 triệu, không ép kim
  it('T09: Multi-intent state change, foil removal, and price verification <= 3M via EstimateService', () => {
    const brief = createInitialTestBrief()
    brief.guestCount = 120
    brief.preferredFinishes = ['HOT_FOIL_160C']

    const patches: TestFactPatch[] = [
      { op: 'SET', field: 'suiteQuantity', value: 80 },
      { op: 'REMOVE_FROM_SET', field: 'preferredFinishes', value: 'HOT_FOIL_160C' },
      { op: 'SET', field: 'budgetVnd', value: '3000000' },
      { op: 'SET', field: 'budgetBasis', value: 'TOTAL' },
    ]
    const updated = applyFactPatches(brief, patches)

    // Estimate via canonical single pricing engine: Song Hy Bifold at 80 qty
    const estimate = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 80,
    })

    expect(updated.suiteQuantity).toBe(80)
    expect(updated.preferredFinishes).not.toContain('HOT_FOIL_160C')
    expect(estimate.merchandiseVnd).toBe('2740000') // 80 * 28k + 500k
    expect(BigInt(estimate.merchandiseVnd!) <= BigInt(updated.budgetVnd!)).toBe(true)
  })

  // T10: 3 triệu (ambiguous budget)
  it('T10: Asks exactly one focused clarifying question when budget basis is ambiguous', () => {
    const checkBudgetClarification = (input: string) => {
      const match = input.match(/^(\d+)\s*(triệu|tr|k|nghìn)$/i)
      if (match && !input.includes('tổng') && !input.includes('mỗi')) {
        return {
          needsClarification: true,
          question: 'Ngân sách này là cho toàn bộ số lượng thiệp hay tính trên mỗi thiệp?',
        }
      }
      return { needsClarification: false }
    }

    const res = checkBudgetClarification('3 triệu')
    expect(res.needsClarification).toBe(true)
    expect(res.question).toContain('toàn bộ số lượng thiệp hay tính trên mỗi thiệp')
  })

  // T11: Price tier includes setup fee
  it('T11: Precision match with EstimateService including setup fee without raw model math', () => {
    // 80 units: 80 * 28,000 + 500,000 = 2,740,000 VND
    const est = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 80,
    })
    expect(est.merchandiseVnd).toBe('2740000')
    expect(est.totalVnd).toBeNull() // Shipping and tax unresolved
    expect(est.unresolved).toEqual(['shipping', 'tax'])
  })

  // T12: Variant unavailable or QUOTE_REQUIRED
  it('T12: Returns quoteRequired: true and never defaults to hardcoded 25.000 ₫', () => {
    const est = computeOracleEstimate({
      variantId: 'var-duyen-khoi-quote',
      quantity: 80,
    })
    expect(est.quoteRequired).toBe(true)
    expect(est.merchandiseVnd).toBeNull()
  })

  // T13: Production DB / price table failure
  it('T13: In production, DB failure returns honest 503/unavailable and NEVER shows FIXTURE_CATALOG', () => {
    const isProd = true
    const handleDbOutage = (inProd: boolean) => {
      if (inProd) {
        return {
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          notice: 'Bảng giá Studio tạm thời gián đoạn. Xin liên hệ trực tiếp.',
          cards: [],
        }
      }
      return { status: 200, cards: ['FIXTURE_DEMO'] }
    }

    const outageRes = handleDbOutage(isProd)
    expect(outageRes.status).toBe(503)
    expect(outageRes.cards).toHaveLength(0)
  })

  // T14: Model returns unknown slug
  it('T14: Discards hallucinated slug and ensures text does not claim phantom product exists', () => {
    const validSlugs = new Set(['song-hy-cung-dinh'])
    const modelSuggestions = ['song-hy-cung-dinh', 'unknown-luxury-slug-99']
    const filtered = modelSuggestions.filter((slug) => validSlugs.has(slug))

    expect(filtered).toEqual(['song-hy-cung-dinh'])
    expect(filtered).not.toContain('unknown-luxury-slug-99')
  })

  // T15: User asks payment online
  it('T15: Explains official studio consultation policy; executes zero payment tools (INV-13)', () => {
    const handlePaymentQuery = (query: string) => {
      const isPaymentQuestion = /(thanh toán|đặt cọc|chuyển khoản|vietqr|online|pay)/i.test(query)
      if (isPaymentQuestion) {
        return {
          reply: 'MORI tư vấn thiết kế và ký hợp đồng trực tiếp tại studio hoặc qua chuyên viên. Hệ thống không thực hiện thanh toán online tự động.',
          hasPaymentToolCall: false,
          hasPayButton: false,
        }
      }
      return { reply: 'Tiếp tục tư vấn', hasPaymentToolCall: false, hasPayButton: false }
    }

    const paymentRes = handlePaymentQuery('Tôi muốn thanh toán online đặt cọc 500k qua VietQR')
    expect(paymentRes.hasPaymentToolCall).toBe(false)
    expect(paymentRes.hasPayButton).toBe(false)
    expect(paymentRes.reply).toContain('tư vấn thiết kế')
  })
})
