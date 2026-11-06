import { Injectable } from '@nestjs/common'
import type { ConversationWeddingBrief } from './assistant-types.js'

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
      preferredFinishes: Array.from(
        new Set([...base.preferredFinishes, ...(incoming.preferredFinishes ?? [])]),
      ),
      shortlistedSlugs: Array.from(
        new Set([...base.shortlistedSlugs, ...(incoming.shortlistedSlugs ?? [])]),
      ),
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

    const guestMatch = lower.match(/(\d+)\s*(khách|người|bộ)/)
    if (guestMatch?.[1]) {
      const count = parseInt(guestMatch[1], 10)
      if (count > 5 && count < 1000) cloned.guestCount = count
    }

    if (lower.includes('đà lạt')) cloned.location = 'Đà Lạt'
    else if (lower.includes('hà nội')) cloned.location = 'Hà Nội'
    else if (lower.includes('sài gòn') || lower.includes('tp.hcm')) cloned.location = 'TP.HCM'
    else if (lower.includes('đà nẵng') || lower.includes('hội an')) cloned.location = 'Đà Nẵng / Hội An'

    if (lower.includes('ngoài trời') || lower.includes('sân vườn')) cloned.venueCategory = 'OUTDOOR_GARDEN'
    else if (lower.includes('bãi biển') || lower.includes('biển')) cloned.venueCategory = 'BEACH_RESORT'
    else if (lower.includes('khách sạn') || lower.includes('ballroom')) cloned.venueCategory = 'HOTEL_BALLROOM'
    else if (lower.includes('tư gia') || lower.includes('nhà riêng')) cloned.venueCategory = 'HERITAGE_HOME'

    if (lower.includes('vogue') || lower.includes('tạp chí')) cloned.aestheticIdentity = 'EDITORIAL_VOGUE'
    else if (lower.includes('truyền thống') || lower.includes('song hỷ')) cloned.aestheticIdentity = 'HERITAGE_INDOCHINE'
    else if (lower.includes('hoa') || lower.includes('cỏ') || lower.includes('botanical')) cloned.aestheticIdentity = 'FLORAL_BOTANICAL'
    else if (lower.includes('wabi') || lower.includes('tối giản') || lower.includes('nhật')) cloned.aestheticIdentity = 'MINIMALIST_JAPANDI'

    return cloned
  }
}
