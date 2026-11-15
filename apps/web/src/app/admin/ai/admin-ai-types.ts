export interface InitialConfigPayload {
  config: {
    provider: 'CODEX' | 'GROQ' | 'LOCAL_ONLY'
    codexApiKeyMasked: string
    hasCodexApiKey: boolean
    codexBaseUrl: string
    codexPrimaryModel: string
    codexFallbackModel: string
    groqApiKeyMasked: string
    hasGroqApiKey: boolean
    groqPrimaryModel: string
  }
  availableCodexModels: string[]
  availableGroqModels: string[]
}

export interface TestResultData {
  ok: boolean
  message: string
}

export interface AiSessionTurn {
  id: string
  turnIndex: number
  timestamp: string
  userMessage: string
  modelUsed: string
  fallbackTier: number
  latencyMs: number
  assistantReply: string
  suggestedProducts: Array<{
    slug: string
    name: string
    startingPriceVnd: string
  }>
}

export interface AdminReplyMessage {
  id: string
  timestamp?: string
  sender?: string
  message?: string
  content?: string
  adminName?: string
  createdAt?: string
}

export interface AiConversationSession {
  sessionId: string
  createdAt: string
  updatedAt: string
  turnsCount: number
  lastModelUsed: string
  needsHumanSupport?: boolean
  needsHuman?: boolean
  escalated?: boolean
  escalatedAt?: string | null
  customerContact?: string | null
  contactInfo?: string | null
  escalationReason?: string | null
  escalationNote?: string | null
  escalationRequestedAt?: string | null
  adminReplies?: AdminReplyMessage[]
  brief: {
    coupleNames?: string | null
    weddingDate?: string | null
    location?: string | null
    guestCount?: number | null
    budget?: string | null
    aesthetic?: string | null
    targetShape?: string | null
  }
  turns: AiSessionTurn[]
}

export interface StorefrontOrderRecord {
  orderCode: string
  customerName: string
  contact: string
  productSummary: string
  orderType: 'PAPER' | 'DIGITAL' | 'COMBO'
  quantity: number
  totalAmountVnd: string
  paidAmountVnd: string
  paymentStatus: string
  shippingAddress: string
  paperStepIndex: number | null
  onlineStepIndex: number | null
  createdAt: string
}

export interface CustomRequestRecord {
  id: string
  customerName: string
  contact: string
  email: string
  coupleNames: string
  weddingDate: string
  style: string
  fontCode: string
  styleNote: string
  quantity: string
  status: string
  adminNote: string
  createdAt: string
}
