import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { formatVnd } from '@mori/domain'
import { acceptedProofId } from './accepted-proof.js'
import { loadShippingSnapshot } from './order-address.js'
import { PLACE_ORDER_COMMAND, placeOrderHash } from './place-order-hash.js'

export interface PlacedOrder {
  orderId: string
  status: 'SUBMITTED'
  currency: 'VND'
  totalAmountVnd: string
  quoteId: string
  messageCode: 'ORDER_REQUEST_RECEIVED'
}

@Injectable()
export class PlaceOrderService {
  async placeOrder(input: {
    ownerUserId: string
    requestId: string
    quoteId: string
    expectedVersion: number
    idempotencyKey: string
    shippingAddressId?: string
  }): Promise<PlacedOrder> {
    const requestHash = placeOrderHash(input)
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM service_requests WHERE id = ${input.requestId}::uuid FOR UPDATE`
      const request = await tx.serviceRequest.findFirst({
        where: { id: input.requestId, ownerUserId: input.ownerUserId },
      })
      if (!request) throw new NotFoundException()
      const replay = await tx.idempotencyRecord.findUnique({
        where: {
          principalId_command_key: {
            principalId: input.ownerUserId,
            command: PLACE_ORDER_COMMAND,
            key: input.idempotencyKey,
          },
        },
      })
      if (replay && replay.requestHash !== requestHash) {
        throw new UnprocessableEntityException('This idempotency key was already used')
      }
      if (replay) {
        const replayed = await tx.order.findUnique({ where: { id: replay.resourceId } })
        if (replayed) {
          refuseCancelled(replayed.status)
          return toPlacedOrder(replayed)
        }
      }
      const existing = await tx.order.findUnique({ where: { requestId: request.id } })
      if (existing) {
        refuseCancelled(existing.status)
        return toPlacedOrder(existing)
      }
      if (request.version !== input.expectedVersion || request.status !== 'APPROVED') {
        throw new ConflictException('This request can no longer be ordered')
      }
      const live = await tx.$queryRaw<{ expired: boolean }[]>`
        SELECT ("expiresAt" <= NOW()) AS expired
        FROM quotes
        WHERE id = ${input.quoteId}::uuid
          AND "requestId" = ${request.id}::uuid
          AND state = 'ISSUED'
      `
      if (!live[0]) throw new ConflictException('This quote is no longer available')
      if (live[0].expired) {
        throw new ConflictException({ code: 'QUOTE_EXPIRED', message: 'This quote has expired' })
      }
      const quote = await tx.quote.findFirst({
        where: { id: input.quoteId, requestId: request.id, state: 'ISSUED' },
      })
      if (!quote) throw new ConflictException('This quote is no longer available')
      if (quote.shippingAmountVnd === null || quote.taxAmountVnd === null) {
        throw new ConflictException({
          code: 'CHARGE_UNRESOLVED',
          message: 'Shipping and tax must be resolved before an order',
        })
      }
      if (request.scopeFingerprint !== null && request.scopeFingerprint !== quote.scopeFingerprint) {
        throw new ConflictException({
          code: 'SCOPE_CHANGED',
          message: 'The quote no longer matches the brief',
        })
      }
      if (request.kind !== 'DIGITAL') {
        const proof = await tx.designRevision.findFirst({
          where: { requestId: request.id, state: 'APPROVED', approval: { isNot: null } },
          orderBy: { sequence: 'desc' },
        })
        if (!proof || proof.manifestHash !== quote.scopeFingerprint) {
          throw new ConflictException({
            code: 'SCOPE_CHANGED',
            message: 'The quote no longer matches the approved proof',
          })
        }
      }
      const shipping = await loadShippingSnapshot(tx, request.ownerUserId, request.kind, input.shippingAddressId)
      const order = await tx.order.create({
        data: {
          requestId: request.id,
          quoteId: quote.id,
          ownerUserId: request.ownerUserId,
          totalAmountVnd: quote.totalAmountVnd,
          isFixture: quote.isFixture,
          ...shipping,
        },
      })
      if (request.kind !== 'DIGITAL') {
        const proofRevisionId = await acceptedProofId(tx, request.id)
        await tx.physicalFulfillment.create({ data: { orderId: order.id, proofRevisionId } })
      }
      if (request.kind !== 'PAPER') {
        await tx.digitalFulfillment.create({ data: { orderId: order.id } })
      }
      await tx.quote.update({ where: { id: quote.id }, data: { state: 'ACCEPTED' } })
      await tx.serviceRequest.update({
        where: { id: request.id },
        data: { status: 'CONVERTED', version: { increment: 1 } },
      })
      await tx.idempotencyRecord.create({
        data: {
          principalId: input.ownerUserId,
          command: PLACE_ORDER_COMMAND,
          key: input.idempotencyKey,
          requestHash,
          resourceId: order.id,
        },
      })
      return toPlacedOrder(order)
    })
  }
}

function refuseCancelled(status: string): void {
  if (status === 'CANCELLED') {
    throw new ConflictException('A cancelled order cannot be reopened')
  }
}

function toPlacedOrder(order: {
  id: string
  quoteId: string
  totalAmountVnd: bigint
}): PlacedOrder {
  return {
    orderId: order.id,
    status: 'SUBMITTED',
    currency: 'VND',
    totalAmountVnd: formatVnd(order.totalAmountVnd),
    quoteId: order.quoteId,
    messageCode: 'ORDER_REQUEST_RECEIVED',
  }
}
