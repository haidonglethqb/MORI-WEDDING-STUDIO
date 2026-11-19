import type { AgentProposedAction } from './agent-types.js'
import type { AssistantChatMessage, ConversationWeddingBrief } from './assistant-types.js'

const FOLLOWUP_TAG_RE = /<!--\s*FOLLOWUPS\s*:\s*([\s\S]*?)-->/i

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function extractInlineFollowUps(rawReply: string): {
  reply: string
  inlineFollowUps: string[]
} {
  const match = FOLLOWUP_TAG_RE.exec(rawReply)
  const cleanReply = rawReply.replace(FOLLOWUP_TAG_RE, '').trim()
  if (!match?.[1]) return { reply: cleanReply, inlineFollowUps: [] }

  const parsed = match[1]
    .split('|')
    .map((s) => s.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter((s) => s.length >= 4 && s.length <= 72)

  return { reply: cleanReply, inlineFollowUps: [...new Set(parsed)].slice(0, 3) }
}

export function buildSmartFollowUps(params: {
  inlineFollowUps: string[]
  actions: AgentProposedAction[]
  brief: ConversationWeddingBrief
  history: AssistantChatMessage[]
  lastUserMessage: string
  hasUserPhoto?: boolean
}): string[] {
  const recentUserTexts = [
    ...params.history.filter((m) => m.role === 'user').slice(-4).map((m) => m.content),
    params.lastUserMessage,
  ].map(normalizeText)

  const notRepeated = (candidate: string) => {
    const norm = normalizeText(candidate)
    if (!norm) return false
    return !recentUserTexts.some((prev) => prev === norm || (norm.length > 10 && prev.includes(norm)))
  }

  const fromLlm = params.inlineFollowUps.filter(notRepeated)
  if (fromLlm.length >= 2) return fromLlm.slice(0, 3)

  const candidates: string[] = [...fromLlm]
  const hasBespoke = params.actions.some((a) => a.type === 'BESPOKE_DESIGN_PREVIEW')
  const hasDraft = params.actions.some((a) => a.type === 'CREATE_DIGITAL_INVITATION')
  const hasCart = params.actions.some((a) => a.type === 'ADD_TO_CART')

  if (hasBespoke) {
    if (!params.hasUserPhoto) candidates.push('Mình gửi ảnh cưới để ghép vào bìa thiệp nhé')
    if (!params.brief.weddingDate) candidates.push('Thêm ngày cưới & địa điểm vào mẫu này')
    candidates.push('Chỉnh hiệu ứng animation mượt và chậm hơn chút')
    candidates.push('Thử đổi sang một bảng màu khác')
  } else if (hasCart) {
    candidates.push('Thiết kế thêm mẫu thiệp online đồng bộ với mẫu giấy này')
    candidates.push('Gợi ý chất liệu giấy & gia công ép kim đẹp nhất')
  } else if (hasDraft) {
    candidates.push('Tư vấn thêm thiệp giấy đồng bộ để nhận giảm 50% combo')
    candidates.push('Tự thiết kế bản có hiệu ứng animation riêng cho hai bạn')
  } else {
    if (!params.brief.coupleNames) candidates.push('Thiết kế mẫu thiệp online riêng cho hai bạn')
    else candidates.push(`Dựng mẫu thiệp online có animation cho ${params.brief.coupleNames}`)
    if (!params.brief.guestCount) candidates.push('Tính dự toán combo 100 bộ giấy + thiệp online')
    else candidates.push('Gợi ý thêm phong cách tối giản hoặc cổ điển')
  }

  const unique: string[] = []
  for (const item of candidates) {
    if (notRepeated(item) && !unique.some((u) => normalizeText(u) === normalizeText(item))) {
      unique.push(item)
    }
    if (unique.length >= 3) break
  }
  return unique
}
