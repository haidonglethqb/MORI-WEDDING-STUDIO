import { createHash } from 'node:crypto'
import { Body, Controller, Header, Headers, Post, UnprocessableEntityException } from '@nestjs/common'
import { ForbiddenException } from '@nestjs/common'
import { SESSION_COOKIE } from '@mori/contracts'
import type { CataloguePreference } from '@mori/domain'
import { IdentityService } from '../identity/identity.service.js'
import { readCookie } from '../identity/read-cookie.js'
import { AiToolBoundary } from './ai-tool-boundary.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import { RecommendationService } from './recommendation.service.js'

const PRIVATE = 'private, no-store'

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly recommendations: RecommendationService,
    private readonly quota: AssistantQuotaService,
    private readonly tools: AiToolBoundary,
    private readonly identity: IdentityService,
  ) {}

  @Post('recommendations')
  @Header('Cache-Control', PRIVATE)
  async recommend(
    @Headers('cookie') cookie: string | undefined,
    @Headers('x-forwarded-for') forwarded: string | undefined,
    @Body() body: AssistantBody,
  ) {
    if (body.tool) this.tools.run(body.tool)
    const preference = parsePreference(body)
    const actor = await this.actor(cookie, forwarded)
    await this.quota.reserve(actor.subject, actor.limit)
    return this.recommendations.recommend(preference)
  }

  private async actor(cookie: string | undefined, forwarded: string | undefined) {
    try {
      const user = await this.identity.currentUser(readCookie(cookie, SESSION_COOKIE))
      if (user.status === 'ACTIVE') return { subject: `user:${user.id}`, limit: 30 }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
    }
    const ip = forwarded?.split(',')[0]?.trim() || 'local'
    const hash = createHash('sha256').update(ip).digest('hex')
    return { subject: `ip:${hash}`, limit: 5 }
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
