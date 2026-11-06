import { Injectable } from '@nestjs/common'
import type { ConversationWeddingBrief } from './assistant-types.js'

type FinishKey = ConversationWeddingBrief['preferredFinishes'][number]

const FINISH_RULES: Array<[RegExp, RegExp, FinishKey]> = [
  [/(?:không|bỏ|đừng|hủy|thôi)\s+(?:ép kim|dát kim|foil)/i, /(?:ép kim|foil)/i, 'HOT_FOIL_160C'],
  [/(?:không|bỏ|đừng|hủy|thôi)\s+(?:mép xé|deckle)/i, /(?:mép xé|deckle)/i, 'DECKLE_EDGE'],
  [/(?:không|bỏ|đừng|hủy|thôi)\s+(?:sáp|wax)/i, /(?:sáp|wax)/i, 'WAX_SEAL'],
  [/(?:không|bỏ|đừng|hủy|thôi)\s+(?:vellum|bìa can)/i, /(?:vellum|bìa can)/i, 'VELLUM_WRAP'],
  [/(?:không|bỏ|đừng|hủy|thôi)\s+(?:lụa|ribbon|ruy băng)/i, /(?:lụa|ribbon|ruy băng)/i, 'SILK_RIBBON'],
]

@Injectable()
export class ContextExtractor {
  createInitialBrief(): ConversationWeddingBrief {
    return {
      coupleNames: null,
      weddingDate: null,
      season: null,
      venueCategory: null,
      location: null,
      aestheticIdentity: null,
      targetShape: null,
      guestCount: null,
      estimatedSuites: null,
      budgetRangeVnd: null,
      preferredFinishes: [],
      shortlistedSlugs: [],
      lastDiscussedSlug: null,
    }
  }

  mergeBrief(
    base: ConversationWeddingBrief,
    incoming?: Partial<ConversationWeddingBrief> | null,
  ): ConversationWeddingBrief {
    if (!incoming) return { ...base }
    const updated: ConversationWeddingBrief = {
      coupleNames: incoming.coupleNames ?? base.coupleNames,
      weddingDate: incoming.weddingDate ?? base.weddingDate,
      season: incoming.season ?? base.season,
      venueCategory: incoming.venueCategory ?? base.venueCategory,
      location: incoming.location ?? base.location,
      aestheticIdentity: incoming.aestheticIdentity ?? base.aestheticIdentity,
      targetShape: incoming.targetShape ?? base.targetShape,
      guestCount: incoming.guestCount ?? base.guestCount,
      estimatedSuites: incoming.estimatedSuites ?? base.estimatedSuites,
      budgetRangeVnd: incoming.budgetRangeVnd ?? base.budgetRangeVnd,
      preferredFinishes: Array.from(new Set([...base.preferredFinishes, ...(incoming.preferredFinishes ?? [])])),
      shortlistedSlugs: Array.from(new Set([...base.shortlistedSlugs, ...(incoming.shortlistedSlugs ?? [])])),
      lastDiscussedSlug: incoming.lastDiscussedSlug ?? base.lastDiscussedSlug,
    }
    if (updated.guestCount && !updated.estimatedSuites) {
      updated.estimatedSuites = Math.max(20, Math.round(updated.guestCount * 0.65))
    }
    return updated
  }

  boostFromText(brief: ConversationWeddingBrief, text: string): ConversationWeddingBrief {
    const cloned = { ...brief }
    const lower = text.toLowerCase()

    const couple = text.match(/(?:tụi mình là|mình là|chúng mình là|tên tụi mình là)\s+([A-ZÀ-Ỹa-zà-ỹ\s&]+?)(?:,|\.|\s+cưới|\s+dự định|$)/i)
    if (couple?.[1] && couple[1].trim().length > 2 && couple[1].trim().length < 40) cloned.coupleNames = couple[1].trim()

    const suiteMatch = lower.match(/(\d+)\s*(?:bộ|thiệp|set)/)
    const guestMatch = lower.match(/(\d+)\s*(?:khách|người|bạn)/)
    if (guestMatch?.[1]) {
      const count = parseInt(guestMatch[1], 10)
      if (count >= 10 && count <= 1000) {
        cloned.guestCount = count
        if (!suiteMatch) cloned.estimatedSuites = Math.max(20, Math.round(count * 0.65))
      }
    }
    if (suiteMatch?.[1]) {
      const suiteCount = parseInt(suiteMatch[1], 10)
      if (suiteCount >= 10 && suiteCount <= 1000) cloned.estimatedSuites = suiteCount
    }

    if (lower.includes('đà lạt')) cloned.location = 'Đà Lạt'
    else if (lower.includes('hà nội')) cloned.location = 'Hà Nội'
    else if (lower.includes('sài gòn') || lower.includes('tp.hcm')) cloned.location = 'TP.HCM'
    else if (lower.includes('đà nẵng') || lower.includes('hội an')) cloned.location = 'Đà Nẵng / Hội An'

    if (lower.includes('ngoài trời') || lower.includes('sân vườn')) cloned.venueCategory = 'OUTDOOR_GARDEN'
    else if (lower.includes('bãi biển') || lower.includes('biển')) cloned.venueCategory = 'BEACH_RESORT'
    else if (lower.includes('khách sạn') || lower.includes('ballroom')) cloned.venueCategory = 'HOTEL_BALLROOM'
    else if (lower.includes('tư gia') || lower.includes('nhà riêng')) cloned.venueCategory = 'HERITAGE_HOME'
    else if (lower.includes('nhà thờ')) cloned.venueCategory = 'CHURCH'

    if (lower.includes('tháng 12') || lower.includes('tháng 1') || lower.includes('mùa đông')) cloned.season = 'WINTER'
    else if (lower.includes('tháng 3') || lower.includes('tháng 4') || lower.includes('mùa xuân')) cloned.season = 'SPRING'
    else if (lower.includes('tháng 6') || lower.includes('tháng 7') || lower.includes('mùa hè')) cloned.season = 'SUMMER'
    else if (lower.includes('tháng 9') || lower.includes('tháng 10') || lower.includes('mùa thu')) cloned.season = 'AUTUMN'

    if (lower.includes('vogue') || lower.includes('tạp chí') || lower.includes('editorial')) cloned.aestheticIdentity = 'EDITORIAL_VOGUE'
    else if (lower.includes('truyền thống') || lower.includes('song hỷ') || lower.includes('indochine')) cloned.aestheticIdentity = 'HERITAGE_INDOCHINE'
    else if (/(?:không|bỏ|đừng|hủy)\s+(?:thích\s+)?(?:hoa|cỏ|botanical|floral)/i.test(lower)) cloned.aestheticIdentity = null
    else if (lower.includes('hoa') || lower.includes('cỏ') || lower.includes('botanical') || lower.includes('floral')) cloned.aestheticIdentity = 'FLORAL_BOTANICAL'
    else if (lower.includes('wabi') || lower.includes('tối giản') || lower.includes('nhật') || lower.includes('japandi')) cloned.aestheticIdentity = 'MINIMALIST_JAPANDI'

    if (/(?:bỏ|không|đừng)\s+(?:dáng\s+)?gập/i.test(lower) || lower.includes('phẳng') || lower.includes('flat')) cloned.targetShape = 'FLAT'
    else if (/(?:bỏ|không|đừng)\s+(?:khổ\s+)?phẳng/i.test(lower) || lower.includes('gập') || lower.includes('bifold')) cloned.targetShape = 'BIFOLD'

    const finishes = new Set(cloned.preferredFinishes)
    for (const [negRegex, posRegex, finishKey] of FINISH_RULES) {
      if (negRegex.test(lower)) finishes.delete(finishKey)
      else if (posRegex.test(lower)) finishes.add(finishKey)
    }
    cloned.preferredFinishes = Array.from(finishes)

    const budgetMatch = lower.match(/(?:dưới|<|khoảng|tầm)?\s*(\d+(?:\.\d+)?)\s*(triệu|tr|k|nghìn)/)
    if (budgetMatch?.[1]) {
      const mult = budgetMatch[2] === 'triệu' || budgetMatch[2] === 'tr' ? 1_000_000 : 1_000
      cloned.budgetRangeVnd = { min: '0', max: (parseFloat(budgetMatch[1]) * mult).toString() }
    }

    return cloned
  }
}
