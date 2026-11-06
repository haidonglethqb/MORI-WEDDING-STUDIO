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
