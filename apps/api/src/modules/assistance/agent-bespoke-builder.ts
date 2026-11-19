import {
  BespokeDesignBlueprintSchema,
  type BespokeDesignBlueprint,
  type BespokeSectionKey,
  type InvitationFamilies,
  type InvitationScheduleItem,
} from '@mori/contracts'
import { readStr, type ProposalToolOutcome } from './agent-action-proposals.js'
import { sanitizeBespokeCss, sanitizeBespokeHtml } from './agent-bespoke-sanitizer.js'
import type { AgentAttachment, AgentBespokeDraftData } from './agent-types.js'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/
const ISO_LOCAL_RE = /^\d{8}T\d{6}$/
const VALID_SECTIONS: readonly BespokeSectionKey[] = ['hero', 'couple-bio', 'story', 'families', 'event-card', 'dress-code', 'gallery', 'countdown', 'gift-note']
const VALID_TYPO = ['editorial-serif', 'modern-sans', 'romantic-italic', 'heritage-classic'] as const
const VALID_FRAME = ['arch-dome', 'sharp-magazine', 'glass-card', 'imperial-corner', 'polaroid-mat', 'soft-organic'] as const
const VALID_PATTERN = ['none', 'linen-grain', 'starry-dots', 'botanical-wash', 'gold-aura'] as const
const VALID_ORNAMENT = ['wax-seal', 'botanical-branch', 'double-happiness', 'constellation', 'minimal-line', 'zen-enso'] as const
const VALID_HERO = ['arch-portrait', 'full-overlay', 'split-editorial', 'polaroid-story'] as const

const DEFAULT_THEME = {
  bg: '#F8F5EF', surface: '#FFFFFF', text: '#24231F', muted: '#6E695E', accent: '#59634A', border: '#DDD5C7', buttonText: '#FFFFFF',
} as const

function pickEnum<T extends string>(raw: unknown, allowed: readonly T[], fallback: T): T {
  return typeof raw === 'string' && (allowed as readonly string[]).includes(raw.trim()) ? (raw.trim() as T) : fallback
}

function safeHex(raw: unknown, fallback: string): string {
  return typeof raw === 'string' && HEX_RE.test(raw.trim()) ? raw.trim().toUpperCase() : fallback
}

function asObj(raw: unknown): Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
}

function parseMilestones(raw: unknown): NonNullable<BespokeDesignBlueprint['storyMilestones']> {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 4).flatMap((item) => {
    const obj = asObj(item)
    const year = readStr(obj, 'year').slice(0, 30)
    const title = readStr(obj, 'title').slice(0, 80)
    const detail = readStr(obj, 'detail').slice(0, 260)
    return year && title && detail ? [{ year, title, detail }] : []
  })
}

function parseSchedule(raw: unknown): InvitationScheduleItem[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 6).flatMap((item) => {
    const obj = asObj(item)
    const time = readStr(obj, 'time').slice(0, 20)
    const label = (readStr(obj, 'label') || readStr(obj, 'title')).slice(0, 100)
    return time && label ? [{ time, label }] : []
  })
}

function normalizeSectionOrder(raw: unknown, flags: { bio: boolean; story: boolean; dress: boolean; gift: boolean }): BespokeSectionKey[] {
  const picked: BespokeSectionKey[] = ['hero']
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && (VALID_SECTIONS as readonly string[]).includes(item)) {
        const key = item as BespokeSectionKey
        if (!picked.includes(key)) picked.push(key)
      }
    }
  }
  if (picked.length < 3) {
    const defaults: BespokeSectionKey[] = [
      ...(flags.bio ? (['couple-bio'] as const) : []),
      ...(flags.story ? (['story'] as const) : []),
      'event-card',
      ...(flags.dress ? (['dress-code'] as const) : []),
      'gallery',
      'countdown',
      ...(flags.gift ? (['gift-note'] as const) : []),
    ]
    for (const key of defaults) if (!picked.includes(key)) picked.push(key)
  }
  return picked.slice(0, 9)
}

export function executeGenerateBespokeInvitation(
  args: Record<string, unknown>,
  attachments?: AgentAttachment[],
): ProposalToolOutcome {
  const conceptName = (readStr(args, 'conceptName', 'MORI Bespoke Atelier') || 'MORI Bespoke Atelier').slice(0, 100)
  const eyebrowTag = readStr(args, 'eyebrowTag').slice(0, 80)
  const groomName = (readStr(args, 'groomName', 'Chú Rể') || 'Chú Rể').slice(0, 60)
  const brideName = (readStr(args, 'brideName', 'Cô Dâu') || 'Cô Dâu').slice(0, 60)
  const eventTitle = (readStr(args, 'eventTitle', 'Lễ Thành Hôn & Tiệc Cưới Thân Mật') || 'Lễ Thành Hôn & Tiệc Cưới Thân Mật').slice(0, 120)

  const rawTheme = asObj(args['theme'])
  const bgAccent = typeof rawTheme['bgAccent'] === 'string' && HEX_RE.test(rawTheme['bgAccent'].trim()) ? rawTheme['bgAccent'].trim().toUpperCase() : undefined
  const theme = {
    bg: safeHex(rawTheme['bg'], DEFAULT_THEME.bg),
    ...(bgAccent ? { bgAccent } : {}),
    surface: safeHex(rawTheme['surface'], DEFAULT_THEME.surface),
    text: safeHex(rawTheme['text'], DEFAULT_THEME.text),
    muted: safeHex(rawTheme['muted'], DEFAULT_THEME.muted),
    accent: safeHex(rawTheme['accent'], DEFAULT_THEME.accent),
    border: safeHex(rawTheme['border'], DEFAULT_THEME.border),
    buttonText: safeHex(rawTheme['buttonText'], DEFAULT_THEME.buttonText),
  }

  const groomMeta = readStr(args, 'groomMeta').slice(0, 120)
  const brideMeta = readStr(args, 'brideMeta').slice(0, 120)
  const coupleBio = groomMeta || brideMeta ? { ...(groomMeta ? { groomMeta } : {}), ...(brideMeta ? { brideMeta } : {}) } : undefined
  const storyMilestones = parseMilestones(args['storyMilestones'])

  const rawDress = asObj(args['dressCode'])
  const rawSwatches = Array.isArray(rawDress['swatches'])
    ? rawDress['swatches'].filter((s): s is string => typeof s === 'string' && HEX_RE.test(s.trim())).map((s) => s.trim().toUpperCase()).slice(0, 5)
    : []
  const dressTitle = readStr(rawDress, 'title').slice(0, 80)
  const dressNote = readStr(rawDress, 'note').slice(0, 220)
  const dressCode = rawSwatches.length > 0 || dressNote || dressTitle
    ? { ...(dressTitle ? { title: dressTitle } : {}), ...(dressNote ? { note: dressNote } : {}), swatches: rawSwatches }
    : undefined

  const rawGift = asObj(args['giftNote'])
  const giftHeading = readStr(rawGift, 'heading').slice(0, 80)
  const giftMessage = readStr(rawGift, 'message').slice(0, 260)
  const giftNote = giftHeading || giftMessage ? { ...(giftHeading ? { heading: giftHeading } : {}), ...(giftMessage ? { message: giftMessage } : {}) } : undefined

  const sectionOrder = normalizeSectionOrder(args['sectionOrder'], {
    bio: Boolean(coupleBio),
    story: storyMilestones.length > 0,
    dress: Boolean(dressCode),
    gift: Boolean(giftNote),
  })

  const customHtml = sanitizeBespokeHtml(args['customHtml'])
  const customCss = sanitizeBespokeCss(args['customCss'])

  const customDesign = BespokeDesignBlueprintSchema.parse({
    conceptName,
    ...(eyebrowTag ? { eyebrowTag } : {}),
    typography: pickEnum(args['typography'], VALID_TYPO, 'editorial-serif'),
    frameStyle: pickEnum(args['frameStyle'], VALID_FRAME, 'arch-dome'),
    bgPattern: pickEnum(args['bgPattern'], VALID_PATTERN, 'linen-grain'),
    ornament: pickEnum(args['ornament'], VALID_ORNAMENT, 'wax-seal'),
    heroLayout: pickEnum(args['heroLayout'], VALID_HERO, 'arch-portrait'),
    theme,
    sectionOrder,
    ...(coupleBio ? { coupleBio } : {}),
    ...(storyMilestones.length > 0 ? { storyMilestones } : {}),
    ...(dressCode ? { dressCode } : {}),
    ...(giftNote ? { giftNote } : {}),
    ...(customHtml ? { customHtml } : {}),
    ...(customCss ? { customCss } : {}),
  })

  const groomParents = readStr(args, 'groomParents').slice(0, 160)
  const brideParents = readStr(args, 'brideParents').slice(0, 160)
  const families: InvitationFamilies | undefined = groomParents || brideParents
    ? { ...(groomParents ? { groomParents } : {}), ...(brideParents ? { brideParents } : {}) }
    : undefined

  const rawDate = readStr(args, 'weddingDate')
  const scheduleItems = parseSchedule(args['scheduleItems'])
  const uploadedImg = attachments?.find((a) => a.kind === 'image' && a.dataUrl.startsWith('data:image/') && a.dataUrl.length <= 58_000)
  const greeting = readStr(args, 'greeting').slice(0, 500)
  const lunarDate = readStr(args, 'lunarDate').slice(0, 100)
  const venueName = readStr(args, 'venueName').slice(0, 120)
  const venueAddress = readStr(args, 'venueAddress').slice(0, 220)
  const storyCaption = readStr(args, 'storyCaption').slice(0, 220)
  const draftData: AgentBespokeDraftData = {
    displayNames: [groomName, brideName], eventTitle,
    ...(greeting ? { greeting } : {}), ...(ISO_LOCAL_RE.test(rawDate) ? { eventLocalStart: rawDate } : {}),
    ...(lunarDate ? { lunarDate } : {}), ...(venueName ? { venueName } : {}), ...(venueAddress ? { venueAddress } : {}),
    ...(families ? { families } : {}), ...(scheduleItems.length > 0 ? { scheduleItems } : {}),
    ...(uploadedImg ? { heroUrl: uploadedImg.dataUrl } : {}), ...(storyCaption ? { storyCaption } : {}),
  }

  return {
    summary: `Hoàn thiện thiết kế độc bản "${conceptName}"`,
    action: {
      type: 'BESPOKE_DESIGN_PREVIEW',
      title: `Thiệp Online Độc Bản · ${conceptName}`,
      subtitle: `${groomName} & ${brideName} — xem trực tiếp toàn màn hình hoặc xuất bản link mời khách ngay`,
      conceptName,
      customDesign,
      draftData,
    },
    output: {
      ok: true, conceptName, typography: customDesign.typography, frameStyle: customDesign.frameStyle,
      heroLayout: customDesign.heroLayout, themeBg: customDesign.theme.bg, themeAccent: customDesign.theme.accent,
      sections: customDesign.sectionOrder, attachedUserPhoto: Boolean(uploadedImg), hasCustomCanvas: Boolean(customHtml),
    },
  }
}
