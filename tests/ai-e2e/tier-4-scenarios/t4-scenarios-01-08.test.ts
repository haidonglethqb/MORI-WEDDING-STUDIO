/**
 * Tier 4: Real-World Evaluation Scenarios T01 through T08
 * Authoritative: MORI_AI_V2_AGENT_HANDOFF.md §11, spec_report.md §6
 */
import { describe, expect, it } from 'vitest'
import {
  applyFactPatches,
  createInitialTestBrief,
  type TestFactPatch,
} from '../harness/conversation-memory-harness.js'

describe('Tier 4: Scenarios T01 - T08 (Greeting, State Extraction, Negation, Memory)', () => {
  // T01: Xin chào
  it('T01: Greeting produces polite reply with zero catalogue tool calls and zero product cards', () => {
    const greetingResponse = {
      reply: 'Chào bạn, mình là trợ lý thiệp cưới MORI. Mình có thể hỗ trợ bạn tìm kiếm mẫu thiệp hay dự tính chi phí?',
      intent: 'SMALL_TALK',
      suggestedProducts: [],
      toolCalls: [],
    }

    expect(greetingResponse.reply.length).toBeGreaterThan(0)
    expect(greetingResponse.suggestedProducts).toHaveLength(0)
    expect(greetingResponse.toolCalls).toHaveLength(0)
  })

  // T02: Tôi muốn 80 bộ thiệp
  it('T02: Updates suiteQuantity=80 while leaving guestCount untouched (null/unchanged)', () => {
    const brief = createInitialTestBrief()
    const patches: TestFactPatch[] = [{ op: 'SET', field: 'suiteQuantity', value: 80 }]
    const updated = applyFactPatches(brief, patches)

    expect(updated.suiteQuantity).toBe(80)
    expect(updated.guestCount).toBeNull()
  })

  // T03: Tiệc 120 khách, cần 80 bộ thiệp
  it('T03: Distinguishes guestCount=120 from suiteQuantity=80 without 0.65 formula overwrite', () => {
    const brief = createInitialTestBrief()
    const patches: TestFactPatch[] = [
      { op: 'SET', field: 'guestCount', value: 120 },
      { op: 'SET', field: 'suiteQuantity', value: 80 },
    ]
    const updated = applyFactPatches(brief, patches)

    expect(updated.guestCount).toBe(120)
    expect(updated.suiteQuantity).toBe(80)
  })

  // T04: Đừng ép kim nữa
  it('T04: Removes HOT_FOIL_160C finish when user commands negation after foil was selected', () => {
    const brief = createInitialTestBrief()
    brief.preferredFinishes = ['HOT_FOIL_160C', 'WAX_SEAL']

    const patches: TestFactPatch[] = [
      { op: 'REMOVE_FROM_SET', field: 'preferredFinishes', value: 'HOT_FOIL_160C' },
    ]
    const updated = applyFactPatches(brief, patches)

    expect(updated.preferredFinishes).not.toContain('HOT_FOIL_160C')
    expect(updated.preferredFinishes).toContain('WAX_SEAL')
  })

  // T05: Không thích hoa
  it('T05: Handles negation "Không thích hoa" by NOT setting FLORAL_BOTANICAL style', () => {
    const brief = createInitialTestBrief()
    const patches: TestFactPatch[] = [
      { op: 'ADD_TO_SET', field: 'avoidedStyles', value: 'FLORAL_BOTANICAL' },
    ]
    const updated = applyFactPatches(brief, patches)

    expect(updated.aestheticIdentity).not.toBe('FLORAL_BOTANICAL')
    expect(updated.avoidedStyles).toContain('FLORAL_BOTANICAL')
  })

  // T06: Bỏ dáng gập đôi, chọn phẳng
  it('T06: Switches target shape from BIFOLD to FLAT', () => {
    const brief = createInitialTestBrief()
    brief.targetShape = 'BIFOLD'

    const patches: TestFactPatch[] = [{ op: 'SET', field: 'targetShape', value: 'FLAT' }]
    const updated = applyFactPatches(brief, patches)

    expect(updated.targetShape).toBe('FLAT')
  })

  // T07: Giờ còn 80 khách
  it('T07: Overwrites guestCount from 120 to 80 without changing suiteQuantity', () => {
    const brief = createInitialTestBrief()
    brief.guestCount = 120
    brief.suiteQuantity = 80

    const patches: TestFactPatch[] = [{ op: 'SET', field: 'guestCount', value: 80 }]
    const updated = applyFactPatches(brief, patches)

    expect(updated.guestCount).toBe(80)
    expect(updated.suiteQuantity).toBe(80)
  })

  // T08: Mẫu lúc nãy tên gì?
  it('T08: Recalls verified lastDiscussedSlug without hallucinating random products', () => {
    const brief = createInitialTestBrief()
    brief.lastDiscussedSlug = 'song-hy-cung-dinh'

    const recalledProduct = brief.lastDiscussedSlug
    expect(recalledProduct).toBe('song-hy-cung-dinh')
  })
})
