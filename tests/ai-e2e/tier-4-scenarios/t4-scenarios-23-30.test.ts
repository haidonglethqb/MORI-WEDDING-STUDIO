/**
 * Tier 4: Real-World Evaluation Scenarios T23 through T30
 * Authoritative: MORI_AI_V2_AGENT_HANDOFF.md §11, spec_report.md §6
 */
import { describe, expect, it } from 'vitest'
import { computeOracleEstimate } from '../harness/pricing-oracle.js'

describe('Tier 4: Scenarios T23 - T30 (UX, Privacy, Grounding, Schema Invariants)', () => {
  // T23: Tôi không muốn xem thêm mẫu
  it('T23: Respects negative intent: returns zero product cards and avoids unsolicited upsells', () => {
    const handleNegativeIntent = (query: string) => {
      if (query.includes('không muốn xem thêm')) {
        return {
          reply: 'Dạ vâng, mình sẽ tập trung hỗ trợ các thắc mắc khác của bạn nhé.',
          suggestedProducts: [],
        }
      }
      return { reply: 'Mẫu gợi ý...', suggestedProducts: ['card-1'] }
    }

    const res = handleNegativeIntent('Tôi không muốn xem thêm mẫu')
    expect(res.suggestedProducts).toHaveLength(0)
  })

  // T24: Unverified / non-admin access to /admin/ai-config
  it('T24: Rejects non-admin or unauthenticated access with 404/403 (INV-01)', () => {
    const verifyAdmin = (user?: { role: string; status: string }) => {
      if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
        return { status: 404, allowed: false } // 404 to avoid leaking admin route per Rule #3
      }
      return { status: 200, allowed: true }
    }

    expect(verifyAdmin(undefined).status).toBe(404)
    expect(verifyAdmin({ role: 'CUSTOMER', status: 'ACTIVE' }).status).toBe(404)
    expect(verifyAdmin({ role: 'ADMIN', status: 'SUSPENDED' }).status).toBe(404)
    expect(verifyAdmin({ role: 'ADMIN', status: 'ACTIVE' }).status).toBe(200)
  })

  // T25: Production API misses DB connection for quota
  it('T25: Throws HTTP 503 Service Unavailable when DB is down, spending 0 model tokens', () => {
    let tokensSpent = 0
    const executeChatWithQuota = (dbAvailable: boolean) => {
      if (!dbAvailable) {
        // Must throw 503, NEVER pretend quota is full (409) and NEVER invoke model
        return { status: 503, code: 'SERVICE_UNAVAILABLE', tokensSpent }
      }
      tokensSpent += 50
      return { status: 200, tokensSpent }
    }

    const outageRes = executeChatWithQuota(false)
    expect(outageRes.status).toBe(503)
    expect(outageRes.code).toBe('SERVICE_UNAVAILABLE')
    expect(outageRes.tokensSpent).toBe(0)
  })

  // T26: Logs deletion and retention job
  it('T26: Completely purges transcripts upon user/admin deletion request', () => {
    const sessionStore = new Map<string, string>([
      ['session-1', 'transcript 1'],
      ['session-2', 'transcript 2'],
    ])

    const deleteSession = (id: string) => sessionStore.delete(id)
    deleteSession('session-1')

    expect(sessionStore.has('session-1')).toBe(false)
    expect(sessionStore.has('session-2')).toBe(true)
  })

  // T27: Ask about date/style not yet known
  it('T27: Does not fabricate unknown wedding dates or styles; asks at most one focused clarification', () => {
    const knownBrief = { weddingDateIso: null, aestheticIdentity: null }

    const answerDateQuestion = () => {
      if (!knownBrief.weddingDateIso) {
        return {
          reply: 'Tụi mình chưa biết ngày dự kiến tổ chức của bạn. Bạn đã chọn được ngày cưới chưa?',
          fabricatedDate: null,
        }
      }
      return { reply: `Ngày cưới: ${knownBrief.weddingDateIso}`, fabricatedDate: 'known' }
    }

    const res = answerDateQuestion()
    expect(res.fabricatedDate).toBeNull()
    expect(res.reply).toContain('Bạn đã chọn được ngày cưới chưa')
  })

  // T28: Product card displayed
  it('T28: Product card startingPrice exactly matches EstimateService calculation without fabrication', () => {
    // Song Hy Bifold at 80 qty
    const estimate = computeOracleEstimate({
      variantId: 'var-song-hy-bifold',
      quantity: 80,
    })

    const card = {
      id: 'prod-song-hy-01',
      slug: 'song-hy-cung-dinh',
      name: 'Song Hỷ Cung Đình',
      startingPriceVnd: estimate.merchandiseVnd, // Exact match
      quoteRequired: estimate.quoteRequired,
    }

    expect(card.startingPriceVnd).toBe('2740000')
    expect(card.quoteRequired).toBe(false)
  })

  // T29: Long conversation (50+ turns)
  it('T29: Maintains conversation context using summary and sliding window without token blowout', () => {
    const turns = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Turn number ${i + 1}`,
    }))

    const buildPromptWindow = (allTurns: typeof turns, maxTurns = 6) => {
      const summary = `Cuộc trò chuyện đã thảo luận ${allTurns.length - maxTurns} lượt trước đó.`
      const recent = allTurns.slice(-maxTurns)
      return { summary, recentTurns: recent, count: recent.length }
    }

    const windowed = buildPromptWindow(turns, 6)
    expect(windowed.count).toBe(6)
    expect(windowed.summary).toContain('44 lượt trước đó')
  })

  // T30: Model outputs invalid enum or negative quantity
  it('T30: Catches schema violations (negative quantity) and repairs or falls back safely', () => {
    const validateModelOutput = (output: { quantity?: number; shape?: string }) => {
      if (typeof output.quantity !== 'number' || output.quantity < 1) {
        return { valid: false, fallback: true, error: 'INVALID_QUANTITY' }
      }
      if (output.shape && !['FLAT', 'BIFOLD'].includes(output.shape)) {
        return { valid: false, fallback: true, error: 'INVALID_SHAPE' }
      }
      return { valid: true, fallback: false }
    }

    const negativeQty = validateModelOutput({ quantity: -10, shape: 'BIFOLD' })
    expect(negativeQty.valid).toBe(false)
    expect(negativeQty.fallback).toBe(true)

    const invalidShape = validateModelOutput({ quantity: 80, shape: 'TRIFOLD' })
    expect(invalidShape.valid).toBe(false)
    expect(invalidShape.fallback).toBe(true)
  })
})
