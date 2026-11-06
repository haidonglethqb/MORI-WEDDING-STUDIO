import { Injectable } from '@nestjs/common'
import type { ConversationWeddingBrief, EstimatedBudgetSummary } from './assistant-types.js'

/**
 * @deprecated Deprecated in PR-01 (AI-003, AI-016).
 * Single pricing engine routes all calculations through EstimateService.
 */
@Injectable()
export class BespokeEstimator {
  calculateBudget(
    _brief: ConversationWeddingBrief,
    _overrideQuantity?: number,
  ): EstimatedBudgetSummary | null {
    return null
  }
}
