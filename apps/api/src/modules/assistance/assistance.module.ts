import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { AiToolBoundary } from './ai-tool-boundary.js'
import { AssistantController } from './assistant.controller.js'
import { AssistantQuotaService } from './assistant-quota.service.js'
import { RecommendationService } from './recommendation.service.js'
import { GroqAiGateway } from './groq-ai-gateway.js'
import { ContextExtractor } from './context-extractor.js'
import { CatalogProvider } from './catalog-provider.js'
import { ScoringMatcher } from './scoring-matcher.js'
import { BespokeEstimator } from './bespoke-estimator.js'
import { SupervisorGuardrail } from './supervisor-guardrail.js'
import { AssistantOrchestratorService } from './assistant-orchestrator.service.js'
import { AiConfigService } from './ai-config.service.js'
import { AdminAiConfigController } from './admin-ai-config.controller.js'

@Module({
  imports: [IdentityModule],
  controllers: [AssistantController, AdminAiConfigController],
  providers: [
    AiConfigService,
    RecommendationService,
    AssistantQuotaService,
    AiToolBoundary,
    GroqAiGateway,
    ContextExtractor,
    CatalogProvider,
    ScoringMatcher,
    BespokeEstimator,
    SupervisorGuardrail,
    AssistantOrchestratorService,
  ],
  exports: [AssistantOrchestratorService, AiConfigService],
})
export class AssistanceModule {}
