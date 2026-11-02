import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { ExcludePartyService } from './exclude-party.service.js'
import { GuestLinkService } from './guest-link.service.js'
import { GuestPartyController } from './guest-party.controller.js'
import { GuestPartyService } from './guest-party.service.js'
import { GuestRsvpService } from './guest-rsvp.service.js'
import { GuestSessionController } from './guest-session.controller.js'
import { EventRetireService } from './event-retire.service.js'
import { InvitationEventController } from './invitation-event.controller.js'
import { InvitationEditorController } from './invitation-editor.controller.js'
import { OwnerRsvpController } from './owner-rsvp.controller.js'
import { OwnerRsvpService } from './owner-rsvp.service.js'
import { InvitationEditorService } from './invitation-editor.service.js'
import { InvitationListController } from './invitation-list.controller.js'
import { InvitationListService } from './invitation-list.service.js'
import { ReopenRsvpController } from './reopen-rsvp.controller.js'
import { RotateHandleController } from './rotate-handle.controller.js'
import { RotateHandleService } from './rotate-handle.service.js'
import { ReopenRsvpService } from './reopen-rsvp.service.js'
import { RevokeGuestAccessController } from './revoke-guest-access.controller.js'
import { RevokeGuestAccessService } from './revoke-guest-access.service.js'
import { RevokePartyLinkService } from './revoke-party-link.service.js'
import { RsvpExportController } from './rsvp-export.controller.js'
import { RsvpExportService } from './rsvp-export.service.js'
import { RsvpListController } from './rsvp-list.controller.js'
import { RsvpListService } from './rsvp-list.service.js'
import { RsvpService } from './rsvp.service.js'
import { InvitationService } from './invitation.service.js'
import { SwitchRsvpModeController } from './switch-rsvp-mode.controller.js'
import { SwitchRsvpModeService } from './switch-rsvp-mode.service.js'
import { PublicInvitationController } from './public-invitation.controller.js'

@Module({
  imports: [IdentityModule],
  controllers: [
    InvitationListController,
    PublicInvitationController,
    GuestSessionController,
    GuestPartyController,
    RevokeGuestAccessController,
    SwitchRsvpModeController,
    ReopenRsvpController,
    InvitationEventController,
    RotateHandleController,
    OwnerRsvpController,
    InvitationEditorController,
    RsvpListController,
    RsvpExportController,
  ],
  providers: [
    InvitationService,
    GuestLinkService,
    ExcludePartyService,
    GuestRsvpService,
    GuestPartyService,
    RsvpService,
    RsvpListService,
    RsvpExportService,
    RevokePartyLinkService,
    RevokeGuestAccessService,
    SwitchRsvpModeService,
    ReopenRsvpService,
    EventRetireService,
    RotateHandleService,
    OwnerRsvpService,
    InvitationEditorService,
    InvitationListService,
  ],
  exports: [InvitationService],
})
export class InvitationModule {}
