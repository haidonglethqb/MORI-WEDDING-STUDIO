import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'

@Injectable()
export class WithdrawQuoteService {
  async withdraw(quoteId: string): Promise<{ quoteId: string; state: 'WITHDRAWN' }> {
    const prisma = getPrismaClient()
    const located = await prisma.quote.findUnique({ where: { id: quoteId } })
    if (!located) throw new NotFoundException()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${located.requestId}::uuid FOR UPDATE`
      const quote = await tx.quote.findUnique({ where: { id: quoteId } })
      if (!quote) throw new NotFoundException()
      if (quote.state === 'ACCEPTED') {
        throw new ConflictException('This quote is already accepted')
      }
      if (quote.state !== 'ISSUED') {
        throw new ConflictException('This quote can no longer be withdrawn')
      }
      await tx.quote.update({ where: { id: quote.id }, data: { state: 'WITHDRAWN' } })
      return { quoteId: quote.id, state: 'WITHDRAWN' as const }
    })
  }
}
