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

    const coupleMatch = text.match(/(?:tụi mình là|mình là|chúng mình là|tên tụi mình là)\s+([A-ZÀ-Ỹa-zà-ỹ\s&]+?)(?:,|\.|\s+cưới|\s+dự định|$)/i)
    if (coupleMatch?.[1]) {
      const names = coupleMatch[1].trim()
      if (names.length > 2 && names.length < 40) cloned.coupleNames = names
    }

    const guestMatch = lower.match(/(\d+)\s*(khách|người|bộ)/)
    if (guestMatch?.[1]) {
      const count = parseInt(guestMatch[1], 10)
      if (count >= 10 && count <= 1000) {
        cloned.guestCount = count
        cloned.estimatedSuites = Math.max(20, Math.round(count * 0.65))
      }
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
    else if (lower.includes('hoa') || lower.includes('cỏ') || lower.includes('botanical') || lower.includes('floral')) cloned.aestheticIdentity = 'FLORAL_BOTANICAL'
    else if (lower.includes('wabi') || lower.includes('tối giản') || lower.includes('nhật') || lower.includes('japandi')) cloned.aestheticIdentity = 'MINIMALIST_JAPANDI'

    if (lower.includes('gập') || lower.includes('bifold')) cloned.targetShape = 'BIFOLD'
    else if (lower.includes('phẳng') || lower.includes('flat')) cloned.targetShape = 'FLAT'

    const finishes = new Set(cloned.preferredFinishes)
    if (lower.includes('ép kim') || lower.includes('foil')) finishes.add('HOT_FOIL_160C')
    if (lower.includes('mép xé') || lower.includes('deckle')) finishes.add('DECKLE_EDGE')
    if (lower.includes('sáp') || lower.includes('wax')) finishes.add('WAX_SEAL')
    if (lower.includes('vellum') || lower.includes('bìa can')) finishes.add('VELLUM_WRAP')
    if (lower.includes('lụa') || lower.includes('ribbon')) finishes.add('SILK_RIBBON')
    cloned.preferredFinishes = Array.from(finishes)

    return cloned
  }
}
