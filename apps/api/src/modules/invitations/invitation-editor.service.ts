import { Injectable, NotFoundException } from '@nestjs/common'
import {
  InvitationContentSchema,
  type BespokeDesignBlueprint,
  type InvitationFamilies,
  type InvitationDemoPaymentDetails,
  type InvitationPhotos,
  type InvitationScheduleItem,
  type InvitationTemplateConfig,
  type InvitationTemplateId,
  type SaveInvitationDraft,
} from '@mori/contracts'
import { getPrismaClient } from '@mori/database'
import { invitationDemoPaymentDetails } from './invitation-demo-payment.js'
import { InvitationService } from './invitation.service.js'

export interface InvitationEditorDraft {
  invitationId: string
  version: number
  slug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string
  published: boolean
  demoPayment: InvitationDemoPaymentDetails | null
  rsvpMode: 'OFF' | 'OPEN' | 'GUEST_LIST'
  moderationState: 'ACTIVE' | 'SUSPENDED'
  moderationReason: string | null
  eventLocalStart?: string
  timeZone?: string
  templateId?: InvitationTemplateId
  coupleRoles?: [string, string]
  families?: InvitationFamilies
  lunarDate?: string
  venueName?: string
  venueAddress?: string
  mapUrl?: string
  scheduleItems?: InvitationScheduleItem[]
  photos?: InvitationPhotos
  templateConfig?: InvitationTemplateConfig
  customDesign?: BespokeDesignBlueprint
}

@Injectable()
export class InvitationEditorService {
  constructor(private readonly invitations: InvitationService) {}

  async read(ownerUserId: string, invitationId: string): Promise<InvitationEditorDraft> {
    const invitation = await getPrismaClient().invitation.findFirst({
      where: { id: invitationId, project: { ownerUserId } },
      include: {
        draft: true,
        handles: { where: { revokedAt: null }, take: 1 },
        publishedRevision: { select: { payload: true } },
        demoPayment: true,
      },
    })
    if (!invitation?.draft) throw new NotFoundException()
    const content = InvitationContentSchema.parse(invitation.draft.payload)
    return {
      invitationId: invitation.id,
      version: invitation.draft.version,
      slug: invitation.handles[0]?.slug ?? '',
      displayNames: content.displayNames,
      eventTitle: content.eventTitle,
      greeting: content.greeting ?? '',
      published: invitation.status === 'PUBLISHED',
      demoPayment: invitationDemoPaymentDetails(content, invitation.publishedRevision?.payload, invitation.demoPayment),
      rsvpMode: invitation.rsvpMode,
      moderationState: invitation.moderationState,
      moderationReason: invitation.moderationReason,
      ...(content.eventLocalStart ? { eventLocalStart: content.eventLocalStart } : {}),
      ...(content.timeZone ? { timeZone: content.timeZone } : {}),
      ...(content.templateId ? { templateId: content.templateId } : {}),
      ...(content.coupleRoles ? { coupleRoles: content.coupleRoles } : {}),
      ...(content.families ? { families: content.families } : {}),
      ...(content.lunarDate ? { lunarDate: content.lunarDate } : {}),
      ...(content.venueName ? { venueName: content.venueName } : {}),
      ...(content.venueAddress ? { venueAddress: content.venueAddress } : {}),
      ...(content.mapUrl ? { mapUrl: content.mapUrl } : {}),
      ...(content.scheduleItems ? { scheduleItems: content.scheduleItems } : {}),
      ...(content.photos ? { photos: content.photos } : {}),
      ...(content.templateConfig ? { templateConfig: content.templateConfig } : {}),
      ...(content.customDesign ? { customDesign: content.customDesign } : {}),
    }
  }

  async publish(ownerUserId: string, invitationId: string, expectedVersion: number): Promise<InvitationEditorDraft> {
    await this.read(ownerUserId, invitationId)
    await this.invitations.publish(ownerUserId, invitationId, expectedVersion)
    return this.read(ownerUserId, invitationId)
  }

  async save(
    ownerUserId: string,
    invitationId: string,
    input: SaveInvitationDraft,
  ): Promise<InvitationEditorDraft> {
    await this.read(ownerUserId, invitationId)
    await this.invitations.saveDraft(ownerUserId, invitationId, input)
    return this.read(ownerUserId, invitationId)
  }
}
