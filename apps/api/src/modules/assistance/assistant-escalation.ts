import type { AssistantChatResponse, ConversationWeddingBrief } from './assistant-types.js'

const ESCALATION_PHRASES = [
  'gặp nhân viên',
  'nhân viên tư vấn',
  'chuyển admin',
  'chat với nhân viên',
  'gặp admin',
  'hỗ trợ trực tiếp',
]

export function hasHumanEscalationIntent(message: string): boolean {
  const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim()
  return ESCALATION_PHRASES.some((phrase) => normalized.includes(phrase))
}

export function buildEscalationChatResponse(
  brief: ConversationWeddingBrief,
  latencyMs: number,
): AssistantChatResponse {
  return {
    reply:
      'MORI đã tiếp nhận yêu cầu và chuyển phiên hội thoại này tới Admin / nhân viên tư vấn MORI rồi nhé! Nhân viên sẽ phản hồi trực tiếp cho bạn ngay tại khung chat này. Bạn có thể nhấn nút "Chuyển yêu cầu gặp nhân viên" để bổ sung SĐT hoặc email liên hệ nếu cần nha.',
    updatedBrief: brief,
    suggestedProducts: [],
    estimatedBudget: null,
    quickFollowUps: ['Để lại SĐT liên hệ', 'Gửi yêu cầu Thiết kế riêng', 'Tra cứu đơn hàng'],
    needsHumanSupport: true,
    meta: {
      modelUsed: 'escalation/human-handoff',
      fallbackTier: 0,
      latencyMs,
      groundedProductCount: 0,
    },
  }
}
