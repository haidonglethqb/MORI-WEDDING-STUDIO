import type {
  BespokeDesignBlueprint,
  InvitationFamilies,
  InvitationScheduleItem,
} from '@mori/contracts'

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
  imageUrl?: string | null
  isFixture?: boolean
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

export interface AgentToolTraceItem {
  id: string
  tool: string
  label: string
  status: 'running' | 'done' | 'error'
  summary?: string
  durationMs?: number
}

export interface AgentBespokeDraftData {
  displayNames: [string, string]
  coupleRoles?: [string, string]
  eventTitle: string
  greeting?: string
  eventLocalStart?: string
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  families?: InvitationFamilies
  scheduleItems?: InvitationScheduleItem[]
  heroUrl?: string
  storyCaption?: string
}

export interface AgentBespokeDesignActionPayload {
  type: 'BESPOKE_DESIGN_PREVIEW'
  title: string
  subtitle: string
  conceptName: string
  customDesign: BespokeDesignBlueprint
  draftData: AgentBespokeDraftData
}

export type AgentProposedAction =
  | {
      type: 'ADD_TO_CART'
      title: string
      subtitle: string
      productType: 'PAPER' | 'DIGITAL' | 'COMBO'
      slug: string
      name: string
      shape: string
      quantity: number
      unitAmountVnd: number
      imageUrl?: string | null
      linkedDigitalSlug?: string
      linkedDigitalName?: string
      linkedDigitalUnitVnd?: number
    }
  | {
      type: 'CREATE_DIGITAL_INVITATION'
      title: string
      subtitle: string
      templateId: 'editorial-vogue' | 'heritage-palace' | 'botanical-zen'
      groomName: string
      brideName: string
      eventTitle: string
      weddingDate?: string
      lunarDate?: string
      venueName?: string
      venueAddress?: string
      greeting?: string
    }
  | AgentBespokeDesignActionPayload
  | {
      type: 'SUBMIT_CUSTOM_REQUEST'
      title: string
      subtitle: string
      coupleNames?: string
      weddingDate?: string
      quantity?: string
      style?: string
      notes: string
    }
  | {
      type: 'NAVIGATE'
      title: string
      subtitle: string
      href: string
    }

export interface AgentActiveBespokeContext {
  conceptName: string
  customHtml?: string
  customCss?: string
  theme?: Record<string, string | undefined>
  displayNames?: [string, string]
  hasUserPhoto?: boolean
}

export interface AgentLiveContext {
  currentPath?: string
  cartCount?: number
  cartTotalVnd?: number
  cartItemsSummary?: string[]
  activeBespokeDesign?: AgentActiveBespokeContext
}

export interface AgentAttachment {
  kind: 'image'
  dataUrl: string
  label?: string
}

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  senderType?: 'ai' | 'staff' | 'system'
  senderLabel?: string
  timestamp?: string
  content: string
  attachmentDataUrl?: string
  products?: SuggestedProductCard[]
  budget?: EstimatedBudgetSummary | null
  toolTraces?: AgentToolTraceItem[]
  proposedActions?: AgentProposedAction[]
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
  needsHumanSupport?: boolean
  toolTraces?: AgentToolTraceItem[]
  proposedActions?: AgentProposedAction[]
  meta: {
    modelUsed: string
    fallbackTier: number
    latencyMs: number
  }
}
