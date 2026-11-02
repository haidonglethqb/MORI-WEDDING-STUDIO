import { UnprocessableEntityException } from '@nestjs/common'
import { PlaceOrderSchema } from '@mori/contracts'
import { PlaceOrderService } from './place-order.service.js'

const orders = new PlaceOrderService()

export async function placeOrderCommand(actorUserId: string, body: unknown) {
  const parsed = PlaceOrderSchema.safeParse(body)
  if (!parsed.success) {
    throw new UnprocessableEntityException('This command has fields that are not allowed')
  }
  return orders.placeOrder({
    ownerUserId: actorUserId,
    requestId: parsed.data.requestId,
    quoteId: parsed.data.quoteId,
    expectedVersion: parsed.data.expectedVersion,
    idempotencyKey: parsed.data.idempotencyKey,
  })
}
