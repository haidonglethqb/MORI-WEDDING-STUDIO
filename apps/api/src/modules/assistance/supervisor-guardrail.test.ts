import { describe, expect, it } from 'vitest'
import { SupervisorGuardrail } from './supervisor-guardrail.js'

describe('SupervisorGuardrail', () => {
  const guardrail = new SupervisorGuardrail()

  it('sanitizes banned payment keywords and appends artisan proof policy', () => {
    const raw =
      'Bạn vui lòng chuyển khoản đặt cọc 50% qua số tài khoản ngân hàng hoặc thanh toán online nhé.'
    const cleaned = guardrail.sanitizeArtisanReply(raw)

    expect(cleaned).not.toContain('chuyển khoản')
    expect(cleaned).not.toContain('đặt cọc')
    expect(cleaned).not.toContain('số tài khoản')
    expect(cleaned).not.toContain('thanh toán online')
    expect(cleaned).toContain('quy trình may đo nghệ nhân')
    expect(cleaned).toContain('Proof')
  })

  it('keeps clean replies intact without altering them unnecessarily', () => {
    const clean = 'MORI xin gửi gắm mẫu thiệp Botanical Herbarium chế tác từ giấy bã mía.'
    const result = guardrail.sanitizeArtisanReply(clean)
    expect(result).toBe(clean)
  })

  it('eliminates raw enums, slug leaks in parentheses, and normalizes pricing units', () => {
    const raw =
      'Dưới đây là ba mẫu BIFOLD phù hợp với phong cách Heritage-Indochine và các hoàn thiện (HOT_FOIL_160C, DECKLE_EDGE, WAX_SEAL):\n1. "Song Hỷ Cung Đình" (traditional-bifold-01) giá 38.000 đ/tờ;\nMọi mẫu đều được dập HOT FOIL và viền DECKLE EDGE.'
    const result = guardrail.sanitizeArtisanReply(raw)

    expect(result).not.toContain('HOT_FOIL_160C')
    expect(result).not.toContain('DECKLE_EDGE')
    expect(result).not.toContain('WAX_SEAL')
    expect(result).not.toContain('traditional-bifold-01')
    expect(result).not.toContain('đ/tờ')
    expect(result).toContain('38.000 ₫ / bộ thiệp')
    expect(result).toContain('gập đôi')
    expect(result).toContain('truyền thống Á Đông')
    expect(result).toContain('ép kim nhiệt 160°C')
    expect(result).toContain('mép xé thủ công Wabi-Sabi')
  })

  it('builds product cards matching schema', () => {
    const cards = guardrail.buildProductCards([
      {
        id: '1',
        slug: 'pure-wabi-sabi',
        name: 'Pure Wabi-Sabi',
        shape: 'FLAT',
        styleTags: ['minimalist'],
        colourTags: ['ivory'],
        unitPriceVnd: 25000n,
        formattedPriceVnd: '25.000 ₫',
      },
    ])

    expect(cards.length).toBe(1)
    expect(cards[0]?.slug).toBe('pure-wabi-sabi')
    expect(cards[0]?.startingPriceVnd).toBe('25.000 ₫')
  })
})
