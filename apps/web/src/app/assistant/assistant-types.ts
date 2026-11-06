export interface ConversationWeddingBrief {
  coupleNames: string | null
  weddingDate: string | null
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | null
  venueCategory: 'OUTDOOR_GARDEN' | 'HOTEL_BALLROOM' | 'BEACH_RESORT' | 'HERITAGE_HOME' | 'CHURCH' | null
  location: string | null
  aestheticIdentity:
    | 'EDITORIAL_VOGUE'
    | 'HERITAGE_INDOCHINE'
    | 'FLORAL_BOTANICAL'
    | 'MINIMALIST_JAPANDI'
    | 'MODERN_CALLIGRAPHY'
    | null
  targetShape: 'BIFOLD' | 'FLAT' | null
  guestCount: number | null
  estimatedSuites: number | null
  budgetRangeVnd: { min: string; max: string } | null
  preferredFinishes: string[]
  shortlistedSlugs: string[]
  lastDiscussedSlug: string | null
}

export interface SuggestedProductCard {
  slug: string
  name: string
  title: string
  subtitle: string
  shape: string
  startingPriceVnd: string
  silhouette?: string
  accentColor?: string
}

export interface EstimatedBudgetSummary {
  quantity: number
  shape: string
  baseAmountVnd: string
  finishesAmountVnd: string
  totalAmountVnd: string
  giftComplimentary: string
}

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: SuggestedProductCard[]
  budget?: EstimatedBudgetSummary | null
  meta?: {
    modelUsed: string
    fallbackTier: number
    latencyMs: number
  }
}

export interface AssistantChatApiResponse {
  reply: string
  updatedBrief: ConversationWeddingBrief
  suggestedProducts: SuggestedProductCard[]
  estimatedBudget: EstimatedBudgetSummary | null
  quickFollowUps: string[]
  meta: {
    modelUsed: string
    fallbackTier: number
    latencyMs: number
  }
}
