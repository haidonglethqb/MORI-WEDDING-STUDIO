import { ConflictException, UnprocessableEntityException } from '@nestjs/common'
import { IssueQuoteSchema } from '@mori/contracts'
import { IssueQuoteService } from './issue-quote.service.js'

const quotes = new IssueQuoteService()

export async function issueQuoteCommand(body: unknown) {
  const parsed = IssueQuoteSchema.safeParse(body)
  if (!parsed.success) {
    throw new UnprocessableEntityException('This command has fields that are not allowed')
  }
  return quotes.issue({
    requestId: parsed.data.requestId,
    totalAmountVnd: BigInt(parsed.data.totalAmountVnd),
    shippingAmountVnd: BigInt(parsed.data.shippingAmountVnd),
    taxAmountVnd: BigInt(parsed.data.taxAmountVnd),
    scopeFingerprint: parsed.data.scopeFingerprint,
    expiresAt: new Date(parsed.data.expiresAt),
    isFixture: parsed.data.isFixture,
  })
}

export async function editIssuedQuote(body: unknown): Promise<never> {
  if (body && typeof body === 'object' && 'totalAmountVnd' in body) {
    throw new UnprocessableEntityException('This command has fields that are not allowed')
  }
  throw new ConflictException('An issued quote cannot be edited')
}
