import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { AiToolBoundary } from './ai-tool-boundary.js'
import { AssistantController } from './assistant.controller.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import { RecommendationService } from './recommendation.service.js'

@Module({
  imports: [IdentityModule],
  controllers: [AssistantController],
  providers: [RecommendationService, AssistantQuotaService, AiToolBoundary],
})
export class AssistanceModule {}
