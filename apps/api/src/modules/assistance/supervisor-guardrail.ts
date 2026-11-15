import { Injectable } from '@nestjs/common'
import type {
  CatalogProductItem,
  EstimatedBudgetSummary,
  SuggestedProductCard,
} from './assistant-types.js'

const HUMAN_SUPPORT_GUIDANCE =
  'Bạn có thể dùng nút "Chuyển yêu cầu gặp nhân viên" ngay trong khung chat hoặc gửi yêu cầu tại mục Thiết kế riêng trong Bộ sưu tập để đội ngũ MORI hỗ trợ trực tiếp nhé.'

@Injectable()
export class SupervisorGuardrail {
  sanitizeArtisanReply(rawReply: string): string {
    let sanitized = rawReply || 'MORI rất hân hạnh được đồng hành cùng ngày trọng đại của bạn.'

    // 1. Strip internal slug leaks like "(slug: traditional-bifold-01)" or "(minimalist-flat-01)"
    sanitized = sanitized.replace(/\s*\([a-z0-9_.\s-]*(?:flat|bifold|traditional|minimalist|editorial|floral|typography|calligraphy|slug|mã)[^)]*\)/gi, '')

    // 2. Remove parenthesized enum lists, e.g. "(HOT_FOIL_160C, DECKLE_EDGE, WAX_SEAL)"
    sanitized = sanitized.replace(/\s*\([A-Z0-9_,\s-]+\)/g, (match) => {
      if (/HOT_FOIL|DECKLE|WAX_SEAL|VELLUM|SILK|BIFOLD|FLAT|INDOCHINE/i.test(match)) {
        return ''
      }
      return match
    })

    // 3. Translate any raw enum constants into elegant Vietnamese
    sanitized = sanitized.replace(/\bHOT[\s_]+FOIL(?:[\s_]+160C)?\b/gi, 'ép kim nhiệt 160°C')
    sanitized = sanitized.replace(/\bDECKLE[\s_]+EDGE\b/gi, 'mép xé thủ công Wabi-Sabi')
    sanitized = sanitized.replace(/\bWAX[\s_]+SEAL\b/gi, 'con dấu sáp ong tự nhiên')
    sanitized = sanitized.replace(/\bVELLUM[\s_]+WRAP\b/gi, 'áo giấy can mờ vellum')
    sanitized = sanitized.replace(/\bSILK[\s_]+RIBBON\b/gi, 'ruy băng lụa tơ tằm')
    sanitized = sanitized.replace(/\bBI[-_]?FOLD\b/gi, 'gập đôi')
    sanitized = sanitized.replace(/\bGATE[-_]?FOLD\b/gi, 'gập ba')
    sanitized = sanitized.replace(/\bFLAT\b/gi, 'khổ phẳng')
    sanitized = sanitized.replace(/\bHERITAGE[-_]INDOCHINE\b/gi, 'truyền thống Á Đông')
    sanitized = sanitized.replace(/\bEDITORIAL[-_]VOGUE\b/gi, 'tạp chí Vogue Pháp')
    sanitized = sanitized.replace(/\bFLORAL[-_]BOTANICAL\b/gi, 'hoa cỏ thảo mộc')
    sanitized = sanitized.replace(/\bMINIMALIST[-_]JAPANDI\b/gi, 'tối giản Wabi-Sabi')
    sanitized = sanitized.replace(/\bMODERN[-_]CALLIGRAPHY\b/gi, 'thư pháp hiện đại')

    // 4. Normalize units from "tờ" (flyer/sheet) to "bộ" (invitation suite)
    sanitized = sanitized.replace(/(\d+[\d.,]*)\s*(?:đ|₫)\s*\/\s*tờ/gi, '$1 ₫ / bộ thiệp')
    sanitized = sanitized.replace(/(\d+[\d.,]*)\s*(?:đ|₫)\s*mỗi tờ/gi, '$1 ₫ mỗi bộ thiệp')
    sanitized = sanitized.replace(/\bmỗi tờ\b/gi, 'mỗi bộ thiệp')
    sanitized = sanitized.replace(/\btấm thiệp\b/gi, 'bộ thiệp')
    sanitized = sanitized.replace(/(\d+)\s*tờ\b/gi, '$1 bộ')

    // 5. Disallow external Zalo references and direct to on-site escalation/custom design
    if (/\bzalo\b/i.test(sanitized)) {
      sanitized = sanitized.replace(/\bzalo(?:\s+oa)?\b/gi, 'kênh hỗ trợ trực tiếp tại MORI')
      if (!sanitized.includes('Chuyển yêu cầu gặp nhân viên')) {
        sanitized += `\n\n✦ ${HUMAN_SUPPORT_GUIDANCE}`
      }
    }

    return sanitized
  }

  buildProductCards(products: CatalogProductItem[]): SuggestedProductCard[] {
    return products.slice(0, 3).map((prod) => ({
      slug: prod.slug,
      name: prod.name,
      title: prod.name,
      subtitle: prod.isFixture ? 'Mẫu minh họa để tham khảo phong cách.' : prod.shape === 'BIFOLD' ? 'Thiệp gấp đôi' : 'Thiệp phẳng',
      shape: prod.shape,
      startingPriceVnd: prod.isFixture ? 'Mẫu minh họa' : prod.formattedPriceVnd,
      imageUrl: prod.imageUrl ?? null,
      isFixture: prod.isFixture ?? false,
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
