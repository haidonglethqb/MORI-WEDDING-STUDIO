import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { CancellationRequestService } from './cancellation-request.service.js'
import { OrderConfirmService } from './order-confirm.service.js'

const CONFIRM = 'confirm-order'
const CANCEL = 'request-cancellation'

@Injectable()
export class OrderActionService {
  constructor(
    private readonly confirmations: OrderConfirmService,
    private readonly cancellations: CancellationRequestService,
  ) {}

  async confirm(staffUserId: string, orderId: string, idempotencyKey: string) {
    const key = requireKey(idempotencyKey)
    const replay = await this.replay(staffUserId, CONFIRM, key, orderId)
    if (replay) return this.confirmed(orderId)
    const result = await this.confirmations.confirm(staffUserId, orderId)
    await this.remember(staffUserId, CONFIRM, key, orderId, orderId)
    return result
  }

  async requestCancellation(ownerUserId: string, orderId: string, reason: string, idempotencyKey: string) {
    const key = requireKey(idempotencyKey)
    const replay = await this.replay(ownerUserId, CANCEL, key, `${orderId}:${reason.trim()}`)
    if (replay) return { id: replay }
    const created = await this.cancellations.request(ownerUserId, orderId, reason)
    await this.remember(ownerUserId, CANCEL, key, `${orderId}:${reason.trim()}`, created.id)
    return created
  }

  private async replay(principalId: string, command: string, key: string, hash: string): Promise<string | null> {
    const row = await getPrismaClient().idempotencyRecord.findUnique({
      where: { principalId_command_key: { principalId, command, key } },
    })
    if (!row) return null
    if (row.requestHash !== hash) throw new UnprocessableEntityException('This idempotency key was already used')
    return row.resourceId
  }

  private async remember(principalId: string, command: string, key: string, hash: string, resourceId: string) {
    await getPrismaClient().idempotencyRecord.create({
      data: { principalId, command, key, requestHash: hash, resourceId },
    })
  }

  private async confirmed(orderId: string) {
    const order = await getPrismaClient().order.findUniqueOrThrow({ where: { id: orderId } })
    return { status: 'CONFIRMED' as const, totalAmountVnd: order.totalAmountVnd.toString() }
  }
}

function requireKey(value: string): string {
  const key = value.trim()
  if (key.length < 1 || key.length > 80) {
    throw new UnprocessableEntityException('This command needs an idempotency key')
  }
  return key
}
