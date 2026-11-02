import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { formatVnd } from '@mori/domain'
import { IssueQuoteService } from './issue-quote.service.js'
import { PlaceOrderService, type PlacedOrder } from './place-order.service.js'

export interface CustomerQuote {
  quoteId: string
  requestId: string
  state: string
  totalAmountVnd: string
  shippingAmountVnd: string | null
  taxAmountVnd: string | null
  isFixture: boolean
  requestVersion: number
  requestKind: string
}

@Injectable()
export class QuoteOfferService {
  constructor(
    private readonly quotes: IssueQuoteService,
    private readonly orders: PlaceOrderService,
  ) {}

  async issueFixture(input: {
    actorUserId: string
    requestId: string
    totalAmountVnd: bigint
    shippingAmountVnd: bigint
    taxAmountVnd: bigint
    scopeFingerprint: string
    expiresAt: Date
    isFixture: boolean
  }) {
    if (!input.isFixture) throw new ConflictException('A real price book is not loaded')
    if (!(await this.canQuote(input.actorUserId, input.requestId))) throw new NotFoundException()
    return this.quotes.issue(input)
  }

  async listForCustomer(ownerUserId: string, requestId: string): Promise<CustomerQuote[]> {
    const request = await getPrismaClient().serviceRequest.findFirst({
      where: { id: requestId, ownerUserId },
      include: { quotes: { orderBy: { sequence: 'asc' } } },
    })
    if (!request) throw new NotFoundException()
    return request.quotes.map((quote) => ({
      quoteId: quote.id,
      requestId: quote.requestId,
      state: quote.state,
      totalAmountVnd: formatVnd(quote.totalAmountVnd),
      shippingAmountVnd: quote.shippingAmountVnd === null ? null : formatVnd(quote.shippingAmountVnd),
      taxAmountVnd: quote.taxAmountVnd === null ? null : formatVnd(quote.taxAmountVnd),
      isFixture: quote.isFixture,
      requestVersion: request.version,
      requestKind: request.kind,
    }))
  }

  place(input: {
    ownerUserId: string
    requestId: string
    quoteId: string
    expectedVersion: number
    idempotencyKey: string
    shippingAddressId?: string
  }): Promise<PlacedOrder> {
    return this.orders.placeOrder(input)
  }

  private async canQuote(actorUserId: string, requestId: string): Promise<boolean> {
    const prisma = getPrismaClient()
    const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { project: { include: { assignments: true } } },
    })
    if (!actor || actor.status !== 'ACTIVE' || !request) return false
    if (actor.role === 'ADMIN') return true
    if (actor.role !== 'STUDIO') return false
    return request.project.assignments.some((row) => row.staffUserId === actor.id && row.revokedAt === null)
  }
}
