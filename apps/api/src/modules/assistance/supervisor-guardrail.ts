import { Injectable } from '@nestjs/common'
import type {
  CatalogProductItem,
  EstimatedBudgetSummary,
  SuggestedProductCard,
} from './assistant-types.js'

const BANNED_PAYMENT_TERMS = [
  'chuyển khoản',
  'đặt cọc',
  'số tài khoản',
  'thanh toán online',
  'thanh toán',
  'stk',
  'tiền cọc',
  'ngân hàng',
  'momo',
  'vnpay',
  'cọc trước',
]

const ARTISAN_PROOF_POLICY =
  'MORI vận hành theo quy trình may đo nghệ nhân: Xưởng chuẩn bị bản in mẫu thử (Proof) gửi tận tay để bạn cảm nhận chất giấy và ánh kim trước khi quyết định chế tác.'

@Injectable()
export class SupervisorGuardrail {
  sanitizeArtisanReply(rawReply: string): string {
    let sanitized = rawReply || 'MORI rất hân hạnh được đồng hành cùng ngày trọng đại của bạn.'
    let triggered = false

    for (const term of BANNED_PAYMENT_TERMS) {
      if (new RegExp(term, 'i').test(sanitized)) {
        triggered = true
        sanitized = sanitized.replace(new RegExp(term, 'gi'), '[quy trình may đo proof]')
      }
    }

    if (triggered) {
      sanitized += `\n\n✦ Lưu ý về quy trình đặt may đo: ${ARTISAN_PROOF_POLICY}`
    }

    return sanitized
  }

  buildProductCards(products: CatalogProductItem[]): SuggestedProductCard[] {
    return products.slice(0, 3).map((prod) => ({
      slug: prod.slug,
      name: prod.name,
      title: prod.name,
      subtitle: `Chế tác thủ công giấy bã mía 350gsm & dập chìm 160°C (${prod.shape})`,
      shape: prod.shape,
      startingPriceVnd: prod.formattedPriceVnd,
    }))
  }

  validateBudget(
    calculated: EstimatedBudgetSummary | null,
    modelEstimated: EstimatedBudgetSummary | null | undefined,
  ): EstimatedBudgetSummary | null {
    if (calculated) return calculated
    return modelEstimated ?? null
  }
}
