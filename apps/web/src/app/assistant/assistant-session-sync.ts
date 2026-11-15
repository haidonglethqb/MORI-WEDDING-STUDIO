import type { ChatMessageItem } from './assistant-types'

function asRecord(val: unknown): Record<string, unknown> | null {
  return typeof val === 'object' && val !== null ? (val as Record<string, unknown>) : null
}

function readStr(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

export function extractEscalatedFlag(payload: unknown): boolean {
  const root = asRecord(payload)
  if (!root) return false
  const session = asRecord(root['session']) ?? root
  return Boolean(
    session['needsHumanSupport'] ||
      session['needsHuman'] ||
      session['escalated'] ||
      session['escalationRequestedAt'],
  )
}

export function extractStaffReplies(payload: unknown): ChatMessageItem[] {
  const root = asRecord(payload)
  if (!root) return []
  const session = asRecord(root['session']) ?? root

  const candidateLists = [
    session['adminReplies'],
    session['staffReplies'],
    session['replies'],
    session['messages'],
  ]

  const out: ChatMessageItem[] = []
  for (const list of candidateLists) {
    if (!Array.isArray(list)) continue
    for (let idx = 0; idx < list.length; idx += 1) {
      const item = asRecord(list[idx])
      if (!item) continue
      const senderRole = readStr(item, 'senderRole', 'senderType', 'role', 'authorRole')
      if (list === session['messages'] && senderRole && !/admin|staff|human/i.test(senderRole)) {
        continue
      }
      const content = readStr(item, 'content', 'message', 'reply', 'text')
      if (!content) continue
      const timestamp = readStr(item, 'createdAt', 'timestamp', 'sentAt')
      const rawId = readStr(item, 'id') ?? `${timestamp ?? idx}_${content.slice(0, 24)}`
      const senderLabel =
        readStr(item, 'sender', 'senderName', 'adminName', 'staffName') ??
        'Nhân viên tư vấn MORI'

      out.push({
        id: `staff-${rawId}`,
        role: 'assistant',
        senderType: 'staff',
        senderLabel,
        ...(timestamp ? { timestamp } : {}),
        content,
      })
    }
  }
  return out
}

export function mergeSyncedStaffMessages(
  current: ChatMessageItem[],
  synced: ChatMessageItem[],
): ChatMessageItem[] {
  if (synced.length === 0) return current
  const seenIds = new Set(current.map((m) => m.id))
  const seenStaffFingerprints = new Set(
    current
      .filter((m) => m.senderType === 'staff')
      .map((m) => `${m.content.trim()}::${m.timestamp ?? ''}`),
  )

  const additions: ChatMessageItem[] = []
  for (const msg of synced) {
    const fingerprint = `${msg.content.trim()}::${msg.timestamp ?? ''}`
    if (seenIds.has(msg.id) || seenStaffFingerprints.has(fingerprint)) continue
    seenIds.add(msg.id)
    seenStaffFingerprints.add(fingerprint)
    additions.push(msg)
  }

  return additions.length > 0 ? [...current, ...additions] : current
}
