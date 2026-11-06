import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface AiInteractionLog {
  id: string
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
  extractedContext?: {
    coupleNames?: string | null
    weddingDate?: string | null
    location?: string | null
    guestCount?: number | null
    budget?: string | null
  }
}

const MAX_MEMORY_LOGS = 100

@Injectable()
export class AiLogService {
  private memoryLogs: AiInteractionLog[] = []
  private readonly logPath: string

  constructor() {
    this.logPath = join(process.cwd(), '.data', 'ai-interaction-logs.jsonl')
    this.loadInitialLogs()
  }

  recordLog(entry: Omit<AiInteractionLog, 'id' | 'timestamp'>): AiInteractionLog {
    const item: AiInteractionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    }

    this.memoryLogs.unshift(item)
    if (this.memoryLogs.length > MAX_MEMORY_LOGS) {
      this.memoryLogs.pop()
    }

    this.persistLog(item)
    return item
  }

  getLogs(limit = 50): AiInteractionLog[] {
    return this.memoryLogs.slice(0, limit)
  }

  clearLogs(): void {
    this.memoryLogs = []
    try {
      if (existsSync(this.logPath)) {
        writeFileSync(this.logPath, '', 'utf-8')
      }
    } catch {
      // Ignore
    }
  }

  private loadInitialLogs(): void {
    try {
      if (!existsSync(this.logPath)) return
      const content = readFileSync(this.logPath, 'utf-8')
      const lines = content.split('\n').filter((l) => l.trim().length > 0)
      const parsed: AiInteractionLog[] = []
      for (let i = lines.length - 1; i >= 0 && parsed.length < MAX_MEMORY_LOGS; i--) {
        try {
          parsed.push(JSON.parse(lines[i] as string) as AiInteractionLog)
        } catch {
          // Ignore corrupt lines
        }
      }
      this.memoryLogs = parsed
    } catch {
      this.memoryLogs = []
    }
  }

  private persistLog(item: AiInteractionLog): void {
    try {
      const dir = dirname(this.logPath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      appendFileSync(this.logPath, `${JSON.stringify(item)}\n`, 'utf-8')
    } catch {
      // Ignore
    }
  }
}
