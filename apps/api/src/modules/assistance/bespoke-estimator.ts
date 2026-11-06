import { Injectable } from '@nestjs/common'
import type { ConversationWeddingBrief, EstimatedBudgetSummary } from './assistant-types.js'

const BASE_UNIT_FLAT_VND = 25000n
const BASE_UNIT_BIFOLD_VND = 35000n

const FINISH_UNIT_COSTS: Record<string, bigint> = {
  HOT_FOIL_160C: 5000n,
  DECKLE_EDGE: 5000n,
  WAX_SEAL: 6000n,
  VELLUM_WRAP: 4000n,
  SILK_RIBBON: 4000n,
}

const RSVP_COMPLIMENTARY_GIFT =
  'Tặng kèm trang thiệp cưới số RSVP đồng bộ nghệ thuật trị giá 1.200.000 ₫'

@Injectable()
export class BespokeEstimator {
  calculateBudget(
    brief: ConversationWeddingBrief,
    overrideQuantity?: number,
  ): EstimatedBudgetSummary | null {
    const rawQty = overrideQuantity ?? brief.estimatedSuites ?? (brief.guestCount ? Math.round(brief.guestCount * 0.65) : null)
    if (!rawQty || rawQty < 10) return null

    const quantity = Math.min(Math.max(20, rawQty), 500)
    const shape = brief.targetShape === 'BIFOLD' ? 'BIFOLD' : 'FLAT'
    const unitBase = shape === 'BIFOLD' ? BASE_UNIT_BIFOLD_VND : BASE_UNIT_FLAT_VND

    const qtyBig = BigInt(quantity)
    const baseTotal = qtyBig * unitBase

    let finishPerUnit = 0n
    for (const finish of brief.preferredFinishes) {
      const cost = FINISH_UNIT_COSTS[finish]
      if (cost) finishPerUnit += cost
    }

    const finishesTotal = qtyBig * finishPerUnit
    const grandTotal = baseTotal + finishesTotal

    return {
      quantity,
      shape,
      baseAmountVnd: `${Number(baseTotal).toLocaleString('vi-VN')} ₫`,
      finishesAmountVnd: `${Number(finishesTotal).toLocaleString('vi-VN')} ₫`,
      totalAmountVnd: `${Number(grandTotal).toLocaleString('vi-VN')} ₫`,
      giftComplimentary: RSVP_COMPLIMENTARY_GIFT,
    }
  }
}
