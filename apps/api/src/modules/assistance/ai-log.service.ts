import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { AdminReplyItem, AiConversationSession, AiSessionTurn } from './assistant-types.js'

export type { AdminReplyItem, AiConversationSession, AiSessionTurn }

const MAX_SESSIONS = 100

@Injectable()
export class AiLogService {
  private sessionsMap = new Map<string, AiConversationSession>()
  private readonly filePath: string

  constructor() {
    this.filePath = process.env['MORI_AI_LOG_PATH'] || join(process.cwd(), '.data', 'ai-sessions.json')
    this.loadSessions()
  }

  recordTurn(
    sessionId: string,
    turnData: Omit<AiSessionTurn, 'id' | 'turnIndex' | 'timestamp'>,
    context?: AiConversationSession['brief'],
  ): AiConversationSession {
    const cleanSessionId = sessionId || 'session_guest_default'
    const now = new Date().toISOString()

    const session = this.sessionsMap.get(cleanSessionId) ?? this.createEmptySession(cleanSessionId, turnData.modelUsed, now, context)
    const newTurn: AiSessionTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      turnIndex: session.turns.length + 1,
      timestamp: now,
      ...turnData,
    }

    session.turns.push(newTurn)
    session.turnsCount = session.turns.length
    session.updatedAt = now
    session.lastModelUsed = turnData.modelUsed
    if (context) session.brief = { ...session.brief, ...context }

    this.sessionsMap.set(cleanSessionId, session)
    this.persistSessions()
    return session
  }

  markEscalated(
    sessionId: string,
    opts?: { customerContact?: string | null | undefined; reason?: string | null | undefined },
  ): AiConversationSession {
    const cleanId = sessionId.trim() || 'session_guest_default'
    const now = new Date().toISOString()
    const session = this.sessionsMap.get(cleanId) ?? this.createEmptySession(cleanId, 'human-handoff', now)

    session.needsHumanSupport = true
    session.escalatedAt = session.escalatedAt ?? now
    if (opts?.customerContact?.trim()) session.customerContact = opts.customerContact.trim()
    if (opts?.reason?.trim()) session.escalationReason = opts.reason.trim()
    session.adminReplies = session.adminReplies ?? []
    session.updatedAt = now

    this.sessionsMap.set(cleanId, session)
    this.persistSessions()
    return session
  }

  addAdminReply(
    sessionId: string,
    opts: { sender: string; message: string; resolveEscalation?: boolean | undefined },
  ): AiConversationSession | null {
    const session = this.sessionsMap.get(sessionId)
    if (!session) return null

    const now = new Date().toISOString()
    const item: AdminReplyItem = {
      id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      sender: opts.sender,
      message: opts.message.trim(),
    }
    session.adminReplies = [...(session.adminReplies ?? []), item]
    if (opts.resolveEscalation === true) session.needsHumanSupport = false
    session.updatedAt = now

    this.sessionsMap.set(sessionId, session)
    this.persistSessions()
    return session
  }

  private createEmptySession(
    sessionId: string,
    lastModelUsed: string,
    now: string,
    brief?: AiConversationSession['brief'],
  ): AiConversationSession {
    return {
      sessionId,
      createdAt: now,
      updatedAt: now,
      turnsCount: 0,
      lastModelUsed,
      brief: brief ?? {},
      turns: [],
      needsHumanSupport: false,
      escalatedAt: null,
      customerContact: null,
      escalationReason: null,
      adminReplies: [],
    }
  }

  getSessions(limit = 50): AiConversationSession[] {
    const list = Array.from(this.sessionsMap.values())
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return list.slice(0, limit)
  }

  getSession(sessionId: string): AiConversationSession | null {
    return this.sessionsMap.get(sessionId) ?? null
  }

  clearSessions(): void {
    this.sessionsMap.clear()
    this.persistSessions()
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessionsMap.delete(sessionId)
    if (deleted) this.persistSessions()
    return deleted
  }

  private loadSessions(): void {
    try {
      if (!existsSync(this.filePath)) return
      const raw = readFileSync(this.filePath, 'utf-8')
      const parsed = JSON.parse(raw) as AiConversationSession[]
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (s.sessionId) this.sessionsMap.set(s.sessionId, s)
        }
      }
    } catch {
      this.sessionsMap.clear()
    }
  }

  private persistSessions(): void {
    try {
      const dir = dirname(this.filePath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      const list = Array.from(this.sessionsMap.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, MAX_SESSIONS)
      writeFileSync(this.filePath, JSON.stringify(list, null, 2), 'utf-8')
    } catch {
      // Ignore
    }
  }
}
