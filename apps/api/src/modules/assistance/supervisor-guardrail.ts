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

    // 1. Strip internal slug leaks like "(slug: traditional-bifold-01)"
    sanitized = sanitized.replace(/\s*\([a-z\s]*slug:\s*[^)]+\)/gi, '')
    sanitized = sanitized.replace(/\s*\(mã:\s*[^)]+\)/gi, '')

    // 2. Remove parenthesized enum lists, e.g. "(HOT_FOIL_160C, DECKLE_EDGE, WAX_SEAL)"
    sanitized = sanitized.replace(/\s*\([A-Z0-9_,\s]+\)/g, (match) => {
      if (/HOT_FOIL|DECKLE|WAX_SEAL|VELLUM|SILK|BIFOLD|FLAT|INDOCHINE/.test(match)) {
        return ''
      }
      return match
    })

    // 3. Translate any raw enum constants into elegant Vietnamese
    sanitized = sanitized.replace(/\bHOT_FOIL_160C\b/gi, 'ép kim nhiệt 160°C')
    sanitized = sanitized.replace(/\bDECKLE_EDGE\b/gi, 'mép xé thủ công Wabi-Sabi')
    sanitized = sanitized.replace(/\bWAX_SEAL\b/gi, 'con dấu sáp ong tự nhiên')
    sanitized = sanitized.replace(/\bVELLUM_WRAP\b/gi, 'áo giấy can mờ vellum')
    sanitized = sanitized.replace(/\bSILK_RIBBON\b/gi, 'ruy băng lụa tơ tằm')
    sanitized = sanitized.replace(/\bBIFOLD\b/gi, 'gập đôi')
    sanitized = sanitized.replace(/\bFLAT\b/gi, 'khổ phẳng')
    sanitized = sanitized.replace(/\bHERITAGE_INDOCHINE\b/gi, 'truyền thống Á Đông')
    sanitized = sanitized.replace(/\bHOT FOIL\b/gi, 'ép kim nhiệt')

    // 4. Normalize units from "tờ" (flyer/sheet) to "bộ" (invitation suite)
    sanitized = sanitized.replace(/(\d+[\d.,]*)\s*(?:đ|₫)\s*\/\s*tờ/gi, '$1 ₫ / bộ thiệp')
    sanitized = sanitized.replace(/(\d+[\d.,]*)\s*(?:đ|₫)\s*mỗi tờ/gi, '$1 ₫ mỗi bộ')
    sanitized = sanitized.replace(/\bmỗi tờ\b/gi, 'mỗi bộ thiệp')
    sanitized = sanitized.replace(/\btấm thiệp\b/gi, 'bộ thiệp')
    sanitized = sanitized.replace(/(\d+)\s*tờ\b/gi, '$1 bộ')

    // 5. INV-13 Zero Payment guardrail
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
      subtitle: `Chế tác thủ công giấy bã mía 350gsm (${prod.shape === 'BIFOLD' ? 'Gập đôi' : 'Khổ phẳng'})`,
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
