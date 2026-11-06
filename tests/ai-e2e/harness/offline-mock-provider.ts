/**
 * Offline Mock LLM Provider simulating Codex, Groq, and OpenAI responses.
 * Enables deterministic evaluation of T01-T30 without paid live API credentials.
 */

export type MockProviderBehavior =
  | 'GREETING'
  | 'SET_SUITES_80'
  | 'SET_GUESTS_120_SUITES_80'
  | 'REMOVE_FOIL'
  | 'NEGATION_NO_FLORAL'
  | 'SET_SHAPE_FLAT'
  | 'UPDATE_GUESTS_80'
  | 'RECALL_LAST_PRODUCT'
  | 'MULTI_INTENT_80_UNDER_3M'
  | 'CLARIFY_BUDGET_BASIS'
  | 'PAYMENT_POLICY_EXPLANATION'
  | 'PROVIDER_503'
  | 'TIMEOUT_HANG'
  | 'MALFORMED_JSON'
  | 'UNKNOWN_SLUG'
  | 'SCHEMA_VIOLATION_NEGATIVE_QTY'
  | 'NO_EXTRA_CARDS'
  | 'UNPROMPTED_DATE_CLARIFICATION'
  | 'LONG_CONTEXT_SUMMARY'

export interface MockLlmResponse {
  statusCode: number
  reply: string
  intent?: string
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>
  suggestedSlugs?: string[]
  clarificationRequired?: boolean
  totalLatencyMs: number
  usage: { inputTokens: number; outputTokens: number }
}

export class OfflineMockProvider {
  private activeBehavior: MockProviderBehavior = 'GREETING'
  private simulatedLatencyMs = 25

  setBehavior(behavior: MockProviderBehavior): void {
    this.activeBehavior = behavior
  }

  setLatency(latencyMs: number): void {
    this.simulatedLatencyMs = latencyMs
  }

  async executeMockCall(userPrompt: string): Promise<MockLlmResponse> {
    const start = Date.now()

    if (this.activeBehavior === 'TIMEOUT_HANG') {
      return {
        statusCode: 504,
        reply: '',
        totalLatencyMs: 13000,
        usage: { inputTokens: 0, outputTokens: 0 },
      }
    }

    if (this.activeBehavior === 'PROVIDER_503') {
      return {
        statusCode: 503,
        reply: 'Hệ thống AI đối tác tạm thời gián đoạn.',
        totalLatencyMs: this.simulatedLatencyMs,
        usage: { inputTokens: 0, outputTokens: 0 },
      }
    }

    if (this.activeBehavior === 'MALFORMED_JSON') {
      return {
        statusCode: 200,
        reply: '{"intent": "GREETING", "reply": "Xin chào... [MALFORMED',
        totalLatencyMs: this.simulatedLatencyMs,
        usage: { inputTokens: 15, outputTokens: 10 },
      }
    }

    if (this.activeBehavior === 'GREETING') {
      return {
        statusCode: 200,
        reply: 'Chào bạn, mình là trợ lý thiệp cưới MORI. Mình có thể hỗ trợ bạn tìm kiếm mẫu thiệp hay tính giá tạm tính?',
        intent: 'SMALL_TALK',
        suggestedSlugs: [],
        totalLatencyMs: Date.now() - start + this.simulatedLatencyMs,
        usage: { inputTokens: 20, outputTokens: 35 },
      }
    }

    if (this.activeBehavior === 'MULTI_INTENT_80_UNDER_3M') {
      return {
        statusCode: 200,
        reply: 'Đã cập nhật 80 bộ thiệp và bỏ ép kim. Mẫu Song Hỷ Cung Đình phù hợp trong ngân sách 3 triệu.',
        intent: 'MULTI_INTENT',
        toolCalls: [
          {
            name: 'estimate_price',
            args: { variantId: 'var-song-hy-bifold', quantity: 80 },
          },
        ],
        suggestedSlugs: ['song-hy-cung-dinh'],
        totalLatencyMs: Date.now() - start + this.simulatedLatencyMs,
        usage: { inputTokens: 60, outputTokens: 45 },
      }
    }

    if (this.activeBehavior === 'CLARIFY_BUDGET_BASIS') {
      return {
        statusCode: 200,
        reply: 'Ngân sách 3 triệu này bạn dự định cho toàn bộ số lượng thiệp hay mức ngân sách tính trên mỗi thiệp?',
        intent: 'CLARIFICATION',
        clarificationRequired: true,
        suggestedSlugs: [],
        totalLatencyMs: Date.now() - start + this.simulatedLatencyMs,
        usage: { inputTokens: 30, outputTokens: 25 },
      }
    }

    if (this.activeBehavior === 'UNKNOWN_SLUG') {
      return {
        statusCode: 200,
        reply: 'Gợi ý mẫu thiệp cao cấp:',
        intent: 'CATALOGUE_SEARCH',
        suggestedSlugs: ['song-hy-cung-dinh', 'phantom-luxury-silk-99'],
        totalLatencyMs: Date.now() - start + this.simulatedLatencyMs,
        usage: { inputTokens: 40, outputTokens: 30 },
      }
    }

    return {
      statusCode: 200,
      reply: `Đã tiếp nhận yêu cầu: ${userPrompt.slice(0, 30)}`,
      totalLatencyMs: Date.now() - start + this.simulatedLatencyMs,
      usage: { inputTokens: 25, outputTokens: 25 },
    }
  }
}
