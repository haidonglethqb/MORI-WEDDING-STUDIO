import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { AssistanceModule } from './modules/assistance/assistance.module.js'
import { CatalogueModule } from './modules/catalogue/catalogue.module.js'
import { DesignModule } from './modules/design/design.module.js'
import { HealthModule } from './health/health.module.js'
import { IdentityModule } from './modules/identity/identity.module.js'
import { InvitationModule } from './modules/invitations/invitation.module.js'
import { MediaModule } from './modules/media/media.module.js'
import { ModerationModule } from './modules/operations/moderation/moderation.module.js'
import { NotificationModule } from './modules/notifications/notification.module.js'
import { OrdersModule } from './modules/orders/orders.module.js'
import { PricingModule } from './modules/pricing/pricing.module.js'
import { SpikeChecksModule } from './spike-checks/spike-checks.module.js'
import { OriginGuard } from './common/origin-guard.js'
import { ProblemDetailsFilter } from './common/problem-details.filter.js'

@Module({
  imports: [
    HealthModule,
    SpikeChecksModule,
    IdentityModule,
    PricingModule,
    InvitationModule,
    MediaModule,
    ModerationModule,
    NotificationModule,
    OrdersModule,
    CatalogueModule,
    AssistanceModule,
    DesignModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: OriginGuard,
    },
  ],
})
export class AppModule {}
