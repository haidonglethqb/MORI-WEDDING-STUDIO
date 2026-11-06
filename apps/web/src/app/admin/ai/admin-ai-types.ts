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

export interface AiConversationSession {
  sessionId: string
  createdAt: string
  updatedAt: string
  turnsCount: number
  lastModelUsed: string
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
