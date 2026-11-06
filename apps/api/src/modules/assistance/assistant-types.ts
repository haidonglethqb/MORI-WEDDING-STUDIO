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
  preferredFinishes: Array<'HOT_FOIL_160C' | 'DECKLE_EDGE' | 'WAX_SEAL' | 'VELLUM_WRAP' | 'SILK_RIBBON'>
  shortlistedSlugs: string[]
  lastDiscussedSlug: string | null
}

export interface AssistantChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AssistantChatRequest {
  message: string
  history?: AssistantChatMessage[]
  context?: Partial<ConversationWeddingBrief> | null
  sessionId?: string
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
  shape: 'BIFOLD' | 'FLAT'
  baseAmountVnd: string
  finishesAmountVnd: string
  totalAmountVnd: string
  giftComplimentary: string
}

export interface AssistantChatResponse {
  reply: string
  updatedBrief: ConversationWeddingBrief
  suggestedProducts: SuggestedProductCard[]
  estimatedBudget: EstimatedBudgetSummary | null
  quickFollowUps: string[]
  meta: {
    modelUsed: string
    fallbackTier: number
    latencyMs: number
    groundedProductCount?: number
  }
}

export interface CatalogProductItem {
  id: string
  slug: string
  name: string
  shape: string
  styleTags: string[]
  colourTags: string[]
  unitPriceVnd: bigint
  formattedPriceVnd: string
  isFixture?: boolean
}
