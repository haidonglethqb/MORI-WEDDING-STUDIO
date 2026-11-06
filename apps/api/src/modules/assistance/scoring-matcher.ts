import { Injectable } from '@nestjs/common'
import type { CatalogProductItem, ConversationWeddingBrief } from './assistant-types.js'

export interface ScoredProductItem {
  product: CatalogProductItem
  score: number
  reasons: string[]
}

const STYLE_KEYWORDS: Record<string, string[]> = {
  EDITORIAL_VOGUE: ['editorial', 'vogue', 'modern', 'paris'],
  HERITAGE_INDOCHINE: ['traditional', 'heritage', 'indochine', 'song-hy', 'red'],
  FLORAL_BOTANICAL: ['floral', 'botanical', 'garden', 'nature', 'wildflower'],
  MINIMALIST_JAPANDI: ['minimalist', 'japandi', 'wabi-sabi', 'zen', 'pure'],
  MODERN_CALLIGRAPHY: ['calligraphy', 'typography', 'script', 'letterpress'],
}

@Injectable()
export class ScoringMatcher {
  rankProducts(
    catalog: CatalogProductItem[],
    brief: ConversationWeddingBrief,
    suggestedSlugs?: string[],
  ): CatalogProductItem[] {
    const catalogMap = new Map(catalog.map((c) => [c.slug, c]))

    if (suggestedSlugs && suggestedSlugs.length > 0) {
      const matchedFromAi: CatalogProductItem[] = []
      for (const slug of suggestedSlugs) {
        const found = catalogMap.get(slug)
        if (found && !matchedFromAi.some((m) => m.slug === slug)) {
          matchedFromAi.push(found)
        }
      }
      if (matchedFromAi.length > 0) {
        return matchedFromAi.slice(0, 3)
      }
    }

    const scoredList = catalog.map((item) => this.calculateAffinity(item, brief))
    scoredList.sort((a, b) => b.score - a.score)
    return scoredList.slice(0, 2).map((s) => s.product)
  }

  private calculateAffinity(
    product: CatalogProductItem,
    brief: ConversationWeddingBrief,
  ): ScoredProductItem {
    let score = 0
    const reasons: string[] = []

    const targetAesthetic = brief.aestheticIdentity
    if (targetAesthetic) {
      const keywords = STYLE_KEYWORDS[targetAesthetic] ?? []
      const hasMatch = product.styleTags.some((tag) => keywords.includes(tag.toLowerCase()))
      if (hasMatch) {
        score += 40
        reasons.push(`Phù hợp phong cách ${targetAesthetic}`)
      } else {
        score += 10
      }
    } else {
      score += 25
    }

    if (brief.targetShape) {
      if (product.shape === brief.targetShape) {
        score += 20
        reasons.push(`Đúng dáng thiệp ${brief.targetShape}`)
      }
    } else {
      score += 15
    }

    if (brief.budgetRangeVnd) {
      const maxBudget = Number(brief.budgetRangeVnd.max)
      const suites = brief.estimatedSuites ?? 50
      const targetPerSuite = maxBudget / suites
      if (Number(product.unitPriceVnd) <= targetPerSuite) {
        score += 20
        reasons.push('Tối ưu trong ngân sách tiệc')
      } else {
        score += 5
      }
    } else {
      score += 15
    }

    if (brief.venueCategory === 'OUTDOOR_GARDEN' && product.styleTags.includes('floral')) {
      score += 20
      reasons.push('Hài hòa tiệc sân vườn thiên nhiên')
    } else if (brief.venueCategory === 'HERITAGE_HOME' && product.styleTags.includes('traditional')) {
      score += 20
      reasons.push('Tôn vinh không gian tư gia truyền thống')
    } else if (brief.preferredFinishes.includes('HOT_FOIL_160C')) {
      score += 15
      reasons.push('Tương thích kỹ nghệ ép kim nhiệt')
    } else {
      score += 10
    }

    return { product, score, reasons }
  }
}
