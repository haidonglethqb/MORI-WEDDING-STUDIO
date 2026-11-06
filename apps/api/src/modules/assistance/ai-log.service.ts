import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

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
    coupleNames?: string | null | undefined
    weddingDate?: string | null | undefined
    location?: string | null | undefined
    guestCount?: number | null | undefined
    budget?: string | null | undefined
    aesthetic?: string | null | undefined
    targetShape?: string | null | undefined
  }
  turns: AiSessionTurn[]
}

const MAX_SESSIONS = 100

@Injectable()
export class AiLogService {
  private sessionsMap = new Map<string, AiConversationSession>()
  private readonly filePath: string

  constructor() {
    this.filePath = join(process.cwd(), '.data', 'ai-sessions.json')
    this.loadSessions()
  }

  recordTurn(
    sessionId: string,
    turnData: Omit<AiSessionTurn, 'id' | 'turnIndex' | 'timestamp'>,
    context?: AiConversationSession['brief'],
  ): AiConversationSession {
    const cleanSessionId = sessionId || 'session_guest_default'
    const now = new Date().toISOString()

    let session = this.sessionsMap.get(cleanSessionId)
    if (!session) {
      session = {
        sessionId: cleanSessionId,
        createdAt: now,
        updatedAt: now,
        turnsCount: 0,
        lastModelUsed: turnData.modelUsed,
        brief: context ?? {},
        turns: [],
      }
    }

    const turnIndex = session.turns.length + 1
    const newTurn: AiSessionTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      turnIndex,
      timestamp: now,
      ...turnData,
    }

    session.turns.push(newTurn)
    session.turnsCount = session.turns.length
    session.updatedAt = now
    session.lastModelUsed = turnData.modelUsed
    if (context) {
      session.brief = { ...session.brief, ...context }
    }

    this.sessionsMap.set(cleanSessionId, session)
    this.persistSessions()
    return session
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
