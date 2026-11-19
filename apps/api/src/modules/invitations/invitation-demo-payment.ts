import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import type {
  ConfirmInvitationDemoPayment,
  InvitationContent,
  InvitationDemoPaymentDetails,
} from '@mori/contracts'
import { InvitationContentSchema } from '@mori/contracts'
import { getPrismaClient } from '@mori/database'

const DEMO_AMOUNT_VND = 599_000n

function isBespoke(content: InvitationContent): boolean {
  return content.templateId === 'custom-ai' || Boolean(content.customDesign)
}

function requiresDemoPayment(content: InvitationContent, publishedPayload: unknown): boolean {
  if (!isBespoke(content)) return false
  const previous = InvitationContentSchema.safeParse(publishedPayload)
  return !previous.success || !isBespoke(previous.data)
}

export function assertInvitationPaymentAllowsPublish(
  content: InvitationContent,
  publishedPayload: unknown,
  hasReceipt: boolean,
): void {
  if (!hasReceipt && requiresDemoPayment(content, publishedPayload)) {
    throw new HttpException({
      type: 'urn:mori:problem:invitation-demo-payment-required',
      title: 'Confirm demo payment before publishing this invitation',
    }, HttpStatus.PAYMENT_REQUIRED)
  }
}

function paymentDetails(receipt: {
  method: ConfirmInvitationDemoPayment['method']
  amountVnd: bigint
} | null): InvitationDemoPaymentDetails {
  return {
    amountVnd: (receipt?.amountVnd ?? DEMO_AMOUNT_VND).toString(),
    isFixture: true,
    method: receipt?.method ?? null,
  }
}

export function invitationDemoPaymentDetails(
  content: InvitationContent,
  publishedPayload: unknown,
  receipt: Parameters<typeof paymentDetails>[0],
): InvitationDemoPaymentDetails | null {
  return receipt || requiresDemoPayment(content, publishedPayload) ? paymentDetails(receipt) : null
}

@Injectable()
export class InvitationDemoPaymentService {
  async confirm(
    ownerUserId: string,
    invitationId: string,
    method: ConfirmInvitationDemoPayment['method'],
  ): Promise<InvitationDemoPaymentDetails> {
    const prisma = getPrismaClient()
    return prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id: invitationId, project: { ownerUserId } },
        include: { draft: true, publishedRevision: { select: { payload: true } }, demoPayment: true },
      })
      if (!invitation?.draft) throw new NotFoundException()
      if (invitation.demoPayment) return paymentDetails(invitation.demoPayment)
      const content = InvitationContentSchema.parse(invitation.draft.payload)
      if (!requiresDemoPayment(content, invitation.publishedRevision?.payload)) {
        throw new ConflictException('This invitation does not require demo payment')
      }
      await tx.invitationDemoPayment.createMany({
        data: { invitationId, method, amountVnd: DEMO_AMOUNT_VND },
        skipDuplicates: true,
      })
      const receipt = await tx.invitationDemoPayment.findUniqueOrThrow({ where: { invitationId } })
      return paymentDetails(receipt)
    })
  }
}
