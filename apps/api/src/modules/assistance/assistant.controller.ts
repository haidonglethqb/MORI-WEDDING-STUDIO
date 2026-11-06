import { createHash } from 'node:crypto'
import {
  Body,
  Controller,
  ForbiddenException,
  Header,
  Headers,
  Post,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common'
import { z } from 'zod'
import { SESSION_COOKIE } from '@mori/contracts'
import type { CataloguePreference } from '@mori/domain'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiToolBoundary } from './ai-tool-boundary.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import { RecommendationService } from './recommendation.service.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import type { AssistantChatRequest } from './assistant-types.js'

const PRIVATE = 'private, no-store'

const AssistantChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
  sessionId: z.string().optional(),
  clientMessageId: z.string().uuid().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
})

function validateChatRequest(raw: unknown): AssistantChatRequest {
  const result = AssistantChatRequestSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new UnprocessableEntityException(
      issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid chat request',
    )
  }
  return result.data as AssistantChatRequest
}

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly recommendations: RecommendationService,
    private readonly quota: AssistantQuotaService,
    private readonly tools: AiToolBoundary,
    private readonly identity: IdentityService,
    private readonly orchestrator: AssistantOrchestratorService,
  ) {}

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
    const isDev = process.env['APP_ENV'] !== 'production'
    const sessionCookie = readCookie(cookie, 'mori_assistant_session_id')
    if (sessionCookie) {
      const hash = createHash('sha256').update(`sess:${sessionCookie}`).digest('hex')
      return { subject: `anon:${hash}`, limit: isDev ? 1000 : 5 }
    }
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1'
    const hash = createHash('sha256').update(`anon:${ip}`).digest('hex')
    return { subject: `anon:${hash}`, limit: isDev ? 1000 : 5 }
  }
}

interface AssistantBody {
  tool?: string
  productType?: 'PAPER' | 'DIGITAL' | null
  shape?: 'FLAT' | 'BIFOLD' | 'TRIFOLD' | null
  styles?: string[]
  colours?: string[]
  quantity?: number
  budgetVnd?: string | null
  budgetBasis?: 'TOTAL' | 'PER_CARD' | 'UNKNOWN'
}

function parsePreference(body: AssistantBody): CataloguePreference {
  const quantity = body.quantity ?? 0
  const basis = body.budgetBasis
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
    throw new UnprocessableEntityException('Quantity must be between 1 and 500')
  }
  if (basis !== 'TOTAL' && basis !== 'PER_CARD' && basis !== 'UNKNOWN') {
    throw new UnprocessableEntityException('The budget needs a basis')
  }
  return {
    productType: body.productType ?? null,
    shape: body.shape ?? null,
    styles: (body.styles ?? []).slice(0, 8),
    colours: (body.colours ?? []).slice(0, 8),
    quantity,
    budgetVnd: body.budgetVnd ? BigInt(body.budgetVnd) : null,
    budgetBasis: basis,
  }
}
