import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { formatVnd } from '@mori/domain'
import { recordNotice } from '../notifications/notification.service.js'

export interface IssuedQuote {
  quoteId: string
  sequence: number
  state: 'ISSUED'
  totalAmountVnd: string
}

@Injectable()
export class IssueQuoteService {
  async issue(input: {
    requestId: string
    totalAmountVnd: bigint
    shippingAmountVnd: bigint
    taxAmountVnd: bigint
    scopeFingerprint: string
    expiresAt: Date
    isFixture: boolean
  }): Promise<IssuedQuote> {
    if (input.totalAmountVnd < 0n || input.shippingAmountVnd < 0n || input.taxAmountVnd < 0n) {
      throw new ConflictException('Quote amounts cannot be negative')
    }
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${input.requestId}::uuid FOR UPDATE`
      const request = await tx.serviceRequest.findUnique({ where: { id: input.requestId } })
      if (!request) throw new NotFoundException()
      if (request.status === 'CONVERTED' || request.status === 'CANCELLED') {
        throw new ConflictException('This request can no longer be quoted')
      }
      const latest = await tx.quote.findFirst({
        where: { requestId: input.requestId },
        orderBy: { sequence: 'desc' },
      })
      await tx.quote.updateMany({
        where: { requestId: input.requestId, state: 'ISSUED' },
        data: { state: 'SUPERSEDED' },
      })
      const quote = await tx.quote.create({
        data: {
          requestId: input.requestId,
          sequence: (latest?.sequence ?? 0) + 1,
          state: 'ISSUED',
          totalAmountVnd: input.totalAmountVnd,
          shippingAmountVnd: input.shippingAmountVnd,
          taxAmountVnd: input.taxAmountVnd,
          expiresAt: input.expiresAt,
          scopeFingerprint: input.scopeFingerprint,
          isFixture: input.isFixture,
        },
      })
      await recordNotice(tx, {
        recipientUserId: request.ownerUserId,
        eventType: 'QUOTE_ISSUED',
        resourceRef: input.requestId,
        plainText: input.isFixture ? 'Có báo giá mẫu thử mới.' : 'Có báo giá mới.',
      })
      return {
        quoteId: quote.id,
        sequence: quote.sequence,
        state: 'ISSUED' as const,
        totalAmountVnd: formatVnd(quote.totalAmountVnd),
      }
    })
  }
}
