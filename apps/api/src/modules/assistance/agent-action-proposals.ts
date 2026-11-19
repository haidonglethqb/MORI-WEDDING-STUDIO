import {
  DIGITAL_AGENT_CATALOG,
  type AgentProposedAction,
} from './agent-types.js'
import type { CatalogProductItem, ConversationWeddingBrief } from './assistant-types.js'

export interface ProposalToolOutcome {
  summary: string
  output: Record<string, unknown>
  action?: AgentProposedAction
  suggestedSlugs?: string[]
  briefPatch?: Partial<ConversationWeddingBrief>
}

export function readStr(args: Record<string, unknown>, key: string, fallback = ''): string {
  const val = args[key]
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'number' && Number.isFinite(val)) return String(val)
  return fallback
}

export function formatVnd(amount: bigint): string {
  return `${Number(amount).toLocaleString('vi-VN')} ₫`
}

export function executeSearchCatalog(
  args: Record<string, unknown>,
  catalog: CatalogProductItem[],
): ProposalToolOutcome {
  const query = readStr(args, 'query').toLowerCase()
  const style = readStr(args, 'style').toLowerCase()
  const productType = readStr(args, 'productType', 'ALL').toUpperCase()
  const shape = readStr(args, 'shape').toUpperCase()

  const paperHits = productType === 'DIGITAL' ? [] : catalog.filter((p) => {
    if (shape && p.shape.toUpperCase() !== shape) return false
    const hay = `${p.name} ${p.slug} ${p.styleTags.join(' ')} ${p.colourTags.join(' ')}`.toLowerCase()
    if (style && !hay.includes(style)) return false
    if (query && !hay.includes(query)) return false
    return true
  }).slice(0, 4)

  const digitalHits = productType === 'PAPER' ? [] : DIGITAL_AGENT_CATALOG.filter((d) => {
    const hay = `${d.name} ${d.slug} ${d.styleLabel} ${d.styleTags.join(' ')}`.toLowerCase()
    if (style && !hay.includes(style)) return false
    if (query && !hay.includes(query)) return false
    return true
  }).slice(0, 3)

  const finalPaper = paperHits.length > 0 ? paperHits : (productType === 'DIGITAL' ? [] : catalog.slice(0, 3))
  return {
    summary: `Tìm thấy ${finalPaper.length} mẫu giấy, ${digitalHits.length} mẫu online`,
    suggestedSlugs: finalPaper.map((p) => p.slug),
    output: {
      paperProducts: finalPaper.map((p) => ({
        slug: p.slug,
        name: p.name,
        shape: p.shape,
        unitPriceVnd: p.formattedPriceVnd,
        styles: p.styleTags,
        isFixture: Boolean(p.isFixture),
      })),
      digitalProducts: digitalHits.map((d) => ({
        slug: d.slug,
        name: d.name,
        priceVnd: d.formattedPriceVnd,
        comboPrice50OffVnd: formatVnd(d.unitAmountVnd / 2n),
        templateId: d.templateId,
      })),
    },
  }
}

export function executeProposeCart(
  args: Record<string, unknown>,
  catalog: CatalogProductItem[],
): ProposalToolOutcome {
  const type = readStr(args, 'productType', 'PAPER').toUpperCase()
  const slug = readStr(args, 'slug')
  const digital = DIGITAL_AGENT_CATALOG.find((d) => d.slug === slug)
  const paper = catalog.find((c) => c.slug === slug)

  if (type === 'DIGITAL' && digital) {
    return {
      summary: `Chuẩn bị thẻ thêm ${digital.name}`,
      action: {
        type: 'ADD_TO_CART',
        title: `Thêm ${digital.name} vào giỏ`,
        subtitle: `Thiệp cưới Online · ${digital.formattedPriceVnd}`,
        productType: 'DIGITAL',
        slug: digital.slug,
        name: digital.name,
        shape: 'DIGITAL',
        quantity: 1,
        unitAmountVnd: Number(digital.unitAmountVnd),
      },
      output: { ok: true, slug: digital.slug, unitAmountVnd: Number(digital.unitAmountVnd) },
    }
  }
  if (!paper) {
    return { summary: `Từ chối slug không hợp lệ (${slug})`, output: { ok: false, error: 'Slug sản phẩm không tồn tại trong danh mục' } }
  }

  const qty = Math.max(10, Math.min(2000, Math.round(Number(args['quantity'] ?? 100))))
  const unitVnd = paper.unitPriceVnd > 0n ? Number(paper.unitPriceVnd) : 9000
  const linkedSlug = readStr(args, 'linkedDigitalSlug')
  const linked = type === 'COMBO' ? (DIGITAL_AGENT_CATALOG.find((d) => d.slug === linkedSlug) ?? DIGITAL_AGENT_CATALOG[4]) : undefined

  return {
    summary: `Tạo nút thêm ${paper.name} (${qty} bộ)`,
    suggestedSlugs: [paper.slug],
    action: {
      type: 'ADD_TO_CART',
      title: linked ? `Thêm Combo ${paper.name} + ${linked.name}` : `Thêm ${paper.name} (${qty} bộ)`,
      subtitle: linked ? `Ưu đãi giảm 50% thiệp online (chỉ còn ${formatVnd(linked.unitAmountVnd / 2n)})` : `${formatVnd(BigInt(unitVnd))} / bộ · ${qty} bộ`,
      productType: linked ? 'COMBO' : 'PAPER',
      slug: paper.slug,
      name: paper.name,
      shape: paper.shape,
      quantity: qty,
      unitAmountVnd: unitVnd,
      imageUrl: paper.imageUrl ?? null,
      ...(linked ? { linkedDigitalSlug: linked.slug, linkedDigitalName: linked.name, linkedDigitalUnitVnd: Number(linked.unitAmountVnd) } : {}),
    },
    output: { ok: true, slug: paper.slug, quantity: qty, linkedDigitalSlug: linked?.slug ?? null },
  }
}

export function executeProposeDigitalDraft(args: Record<string, unknown>): ProposalToolOutcome {
  const rawTpl = readStr(args, 'templateId', 'editorial-vogue')
  const templateId = rawTpl === 'heritage-palace' || rawTpl === 'botanical-zen' ? rawTpl : 'editorial-vogue'
  const groomName = readStr(args, 'groomName', 'Chú Rể') || 'Chú Rể'
  const brideName = readStr(args, 'brideName', 'Cô Dâu') || 'Cô Dâu'
  const tplLabel = templateId === 'heritage-palace' ? 'Song Hỷ Hoàng Gia' : templateId === 'botanical-zen' ? 'Botanical Wabi-Sabi' : 'Editorial Vogue'

  return {
    summary: `Chuẩn bị bản nháp thiệp ${templateId}`,
    action: {
      type: 'CREATE_DIGITAL_INVITATION',
      title: `Khởi tạo Thiệp Online · ${groomName} & ${brideName}`,
      subtitle: `Bản thiết kế ${tplLabel} — chỉnh sửa ảnh & xuất bản ngay`,
      templateId,
      groomName,
      brideName,
      eventTitle: readStr(args, 'eventTitle', 'Lễ Thành Hôn & Tiệc Mừng') || 'Lễ Thành Hôn & Tiệc Mừng',
      ...(readStr(args, 'weddingDate') ? { weddingDate: readStr(args, 'weddingDate') } : {}),
      ...(readStr(args, 'lunarDate') ? { lunarDate: readStr(args, 'lunarDate') } : {}),
      ...(readStr(args, 'venueName') ? { venueName: readStr(args, 'venueName') } : {}),
      ...(readStr(args, 'venueAddress') ? { venueAddress: readStr(args, 'venueAddress') } : {}),
      ...(readStr(args, 'greeting') ? { greeting: readStr(args, 'greeting') } : {}),
    },
    output: { ok: true, templateId, groomName, brideName },
  }
}

export function executeProposeCustomRequest(args: Record<string, unknown>): ProposalToolOutcome {
  const notes = readStr(args, 'notes', 'Tư vấn thiết kế thiệp cưới riêng theo yêu cầu') || 'Tư vấn thiết kế thiệp cưới riêng theo yêu cầu'
  return {
    summary: 'Chuẩn bị phiếu yêu cầu thiết kế riêng',
    action: {
      type: 'SUBMIT_CUSTOM_REQUEST',
      title: 'Gửi yêu cầu Thiết kế riêng (Bespoke)',
      subtitle: 'Điền nhanh tên & SĐT để đội ngũ nghệ nhân MORI tiếp nhận brief này',
      notes,
      ...(readStr(args, 'coupleNames') ? { coupleNames: readStr(args, 'coupleNames') } : {}),
      ...(readStr(args, 'weddingDate') ? { weddingDate: readStr(args, 'weddingDate') } : {}),
      ...(readStr(args, 'quantity') ? { quantity: readStr(args, 'quantity') } : {}),
      ...(readStr(args, 'style') ? { style: readStr(args, 'style') } : {}),
    },
    output: { ok: true, notes },
  }
}

export function executeUpdateBrief(args: Record<string, unknown>): ProposalToolOutcome {
  const patch: Partial<ConversationWeddingBrief> = {}
  const coupleNames = readStr(args, 'coupleNames')
  const weddingDate = readStr(args, 'weddingDate')
  const location = readStr(args, 'location')
  if (coupleNames) patch.coupleNames = coupleNames
  if (weddingDate) patch.weddingDate = weddingDate
  if (location) patch.location = location
  if (typeof args['guestCount'] === 'number') patch.guestCount = args['guestCount']
  if (typeof args['estimatedSuites'] === 'number') patch.estimatedSuites = args['estimatedSuites']
  return { summary: 'Cập nhật bộ nhớ tiệc cưới', briefPatch: patch, output: { ok: true, updated: patch } }
}
