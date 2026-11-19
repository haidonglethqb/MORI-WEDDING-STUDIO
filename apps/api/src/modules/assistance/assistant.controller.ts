import { createHash } from 'node:crypto'
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  HttpCode,
  Optional,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { SESSION_COOKIE } from '@mori/contracts'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiLogService } from './ai-log.service.js'
import { AiToolBoundary } from './ai-tool-boundary.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import {
  type AssistantBody,
  parsePreference,
  validateChatRequest,
  validateEscalateRequest,
} from './assistant-request-schemas.js'
import { RecommendationService } from './recommendation.service.js'

const PRIVATE = 'private, no-store'

@Controller('assistant')
export class AssistantController {
  private readonly logService: AiLogService

  constructor(
    private readonly recommendations: RecommendationService,
    private readonly quota: AssistantQuotaService,
    private readonly tools: AiToolBoundary,
    private readonly identity: IdentityService,
    private readonly orchestrator: AssistantOrchestratorService,
    @Optional() logService?: AiLogService,
  ) {
    this.logService = logService ?? new AiLogService()
  }

  @Post('recommendations')
  @Header('Cache-Control', PRIVATE)
  async recommend(
    @Headers('cookie') cookie: string | undefined,
    @Req() req: { ip?: string; socket?: { remoteAddress?: string } },
    @Body() body: AssistantBody,
  ) {
    if (body.tool) this.tools.run(body.tool)
    const preference = parsePreference(body)
    const actor = await this.actor(cookie, req)
    await this.quota.reserve(actor.subject, actor.limit)
    return this.recommendations.recommend(preference)
  }

  @Post('chat')
  @Header('Cache-Control', PRIVATE)
  async chat(
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-session-id') xSessionId: string | undefined,
    @Req() req: { ip?: string; socket?: { remoteAddress?: string } },
    @Body() body: unknown,
  ) {
    const validRequest = validateChatRequest(body)
    const actor = await this.actor(cookie, req)
    await this.quota.reserve(actor.subject, actor.limit)
    const effectiveSessionId = validRequest.sessionId || xSessionId || actor.subject
    return this.orchestrator.handleChat(validRequest, effectiveSessionId)
  }

  @Post('chat/stream')
  @HttpCode(200)
  async chatStream(
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-session-id') xSessionId: string | undefined,
    @Req() req: { ip?: string; socket?: { remoteAddress?: string } },
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    const validRequest = validateChatRequest(body)
    const actor = await this.actor(cookie, req)
    await this.quota.reserve(actor.subject, actor.limit)
    const effectiveSessionId = validRequest.sessionId || xSessionId || actor.subject

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'private, no-store, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    if (typeof res.flushHeaders === 'function') res.flushHeaders()

    const emit = (ev: { type: string }) => {
      res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`)
    }

    try {
      await this.orchestrator.handleChatStream(validRequest, effectiveSessionId, emit)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi xử lý Agent'
      emit({ type: 'error', message: msg } as { type: string })
    } finally {
      res.end()
    }
  }

  @Post('escalate')
  @HttpCode(200)
  @Header('Cache-Control', PRIVATE)
  async escalate(
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-session-id') xSessionId: string | undefined,
    @Req() req: { ip?: string; socket?: { remoteAddress?: string } },
    @Body() body: unknown,
  ) {
    const valid = validateEscalateRequest(body)
    const cookieSession = readCookie(cookie, 'mori_assistant_session_id')
    const effectiveSessionId = valid.sessionId || xSessionId || cookieSession || (await this.actor(cookie, req)).subject
    const session = this.logService.markEscalated(effectiveSessionId, {
      customerContact: valid.customerContact,
      reason: valid.reason,
    })
    return { ok: true, session }
  }

  @Get('session')
  @Header('Cache-Control', PRIVATE)
  getSession(
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-session-id') xSessionId: string | undefined,
    @Query('sessionId') querySessionId?: string,
  ) {
    const effectiveId =
      querySessionId?.trim() || xSessionId?.trim() || readCookie(cookie, 'mori_assistant_session_id') || ''
    const session = effectiveId ? this.logService.getSession(effectiveId) : null
    if (!session) {
      return {
        sessionId: effectiveId,
        needsHumanSupport: false,
        escalatedAt: null,
        customerContact: null,
        escalationReason: null,
        adminReplies: [],
        turns: [],
      }
    }
    return {
      ...session,
      needsHumanSupport: Boolean(session.needsHumanSupport),
      adminReplies: session.adminReplies ?? [],
    }
  }

  private async actor(
    cookie: string | undefined,
    req?: { ip?: string; socket?: { remoteAddress?: string } },
  ) {
    try {
      const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
      if (user.status === 'ACTIVE') return { subject: `user:${user.id}`, limit: 30 }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
    }
    const GUEST_DAILY_LIMIT = 5
    const sessionCookie = readCookie(cookie, 'mori_assistant_session_id')
    if (sessionCookie) {
      const hash = createHash('sha256').update(`sess:${sessionCookie}`).digest('hex')
      return { subject: `anon:${hash}`, limit: GUEST_DAILY_LIMIT }
    }
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1'
    const hash = createHash('sha256').update(`anon:${ip}`).digest('hex')
    return { subject: `anon:${hash}`, limit: GUEST_DAILY_LIMIT }
  }
}
