import { Module } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module.js'
import { PricingModule } from '../pricing/pricing.module.js'
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
import { AiLogService } from './ai-log.service.js'
import { AdminAiConfigController } from './admin-ai-config.controller.js'
import { AiProviderTesterService } from './ai-provider-tester.service.js'
import { AiPricingTool } from './ai-pricing-tool.js'
import { AiCatalogueTool } from './ai-catalogue-tool.js'

@Module({
  imports: [IdentityModule, PricingModule],
  controllers: [AssistantController, AdminAiConfigController],
  providers: [
    AiConfigService,
    AiProviderTesterService,
    AiLogService,
    RecommendationService,
    AssistantQuotaService,
    AiToolBoundary,
    GroqAiGateway,
    ContextExtractor,
    CatalogProvider,
    ScoringMatcher,
    BespokeEstimator,
    SupervisorGuardrail,
    AiPricingTool,
    AiCatalogueTool,
    AssistantOrchestratorService,
  ],
  exports: [
    AssistantOrchestratorService,
    AiConfigService,
    AiLogService,
    AiPricingTool,
    AiCatalogueTool,
  ],
})
export class AssistanceModule {}
