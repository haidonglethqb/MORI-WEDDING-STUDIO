import { Module } from '@nestjs/common'
import { IdentityModule } from '../../identity/identity.module.js'
import { AdminModerationController } from './admin-moderation.controller.js'
import { ModerationReportService } from './moderation-report.service.js'
import { ModerationService } from './moderation.service.js'
import { PublicReportController } from './public-report.controller.js'

@Module({
  imports: [IdentityModule],
  controllers: [PublicReportController, AdminModerationController],
  providers: [ModerationReportService, ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
