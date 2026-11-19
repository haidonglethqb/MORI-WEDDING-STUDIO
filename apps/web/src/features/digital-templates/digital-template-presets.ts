import type {
  DigitalInvitationModel,
  DigitalTemplateId,
  InvitationSeedInput,
  PalettePreset,
  PhotoPreset,
  ResolvedTemplateConfig,
  StandardTemplateId,
  TemplateDefinition,
} from './digital-template-types'

export const CURATED_PHOTO_PRESETS: PhotoPreset[] = [
  { id: 'hero-ivory', label: 'Bộ thiệp ngà & hoa trắng', url: '/images/landing/hero-ivory-suite.jpg' },
  { id: 'couple-table', label: 'Bàn tiệc nến ấm áp', url: '/images/blog/personalize-couple-table.jpg' },
  { id: 'romantic-charm', label: 'Khoảnh khắc lãng mạn', url: '/images/blog/style-romantic-charm.jpg' },
  { id: 'luxury-lily', label: 'Hoa loa kèn thanh lịch', url: '/images/blog/style-luxury-lily.jpg' },
  { id: 'rustic-garden', label: 'Khu vườn thảo mộc', url: '/images/blog/style-rustic-garden.jpg' },
  { id: 'classic-blossom', label: 'Sắc hoa cổ điển', url: '/images/blog/style-classic-blossom.jpg' },
]

export function toStandardTemplateId(templateId: DigitalTemplateId): StandardTemplateId {
  return templateId === 'heritage-palace' || templateId === 'botanical-zen' ? templateId : 'editorial-vogue'
}

export const TEMPLATE_DEFINITIONS: Record<StandardTemplateId, TemplateDefinition> = {
  'editorial-vogue': {
    id: 'editorial-vogue',
    name: 'Editorial Vogue Atelier',
    tagline: 'Tạp chí thời trang Paris · Khung vòm & Ảnh bìa lớn',
    description: 'Bố cục tạp chí cao cấp, ảnh chân dung khổ lớn, lịch trình tối giản và nhấn mạnh typography sang trọng.',
    palettes: [
      { id: 'champagne-atelier', name: 'Ngà Champagne', bg: '#faf7f2', surface: '#ffffff', text: '#1f241c', muted: '#5c6457', accent: '#9c7934', border: '#d6c396', buttonText: '#fffdf8' },
      { id: 'obsidian-noir', name: 'Đen Huyền Bí', bg: '#191b18', surface: '#232622', text: '#f6f2e9', muted: '#b8b2a5', accent: '#d8b460', border: '#5c5035', buttonText: '#191b18' },
      { id: 'blush-rose', name: 'Hồng Phấn Couture', bg: '#fbf4f2', surface: '#ffffff', text: '#2e2222', muted: '#735c5c', accent: '#a3635f', border: '#dfc2bf', buttonText: '#fffaf9' },
    ],
    frames: [
      { id: 'arch-dome', label: 'Khung vòm Pháp' },
      { id: 'sharp-editorial', label: 'Tạp chí viền sắc' },
      { id: 'vellum-pill', label: 'Giấy can bo mềm' },
    ],
    motifs: [
      { id: 'wax-seal', label: 'Dấu sáp Hoàng gia' },
      { id: 'monogram', label: 'Chữ lồng Monogram' },
      { id: 'roman-crest', label: 'Huy hiệu La Mã' },
    ],
  },
  'heritage-palace': {
    id: 'heritage-palace',
    name: 'Song Hỷ Hoàng Gia',
    tagline: 'Á Đông trang trọng · Song Hỷ, Gia đình hai họ & Lịch Âm',
    description: 'Tôn vinh lễ nghi truyền thống với gia phả hai bên, ngày Hoàng Đạo Âm – Dương và họa tiết Cung Đình.',
    palettes: [
      { id: 'imperial-crimson', name: 'Đỏ Son Hoàng Gia', bg: '#611514', surface: '#490f0e', text: '#fff7ea', muted: '#e5d4b8', accent: '#e8c15d', border: '#c99d3b', buttonText: '#3b0c0b' },
      { id: 'ivory-gold', name: 'Ngà Kim Sa', bg: '#fbf7ee', surface: '#ffffff', text: '#4a1615', muted: '#7a4d4a', accent: '#a82420', border: '#cfa445', buttonText: '#fffaf2' },
      { id: 'jade-emperor', name: 'Ngọc Bích Cổ Điển', bg: '#18352c', surface: '#112821', text: '#f7f4e8', muted: '#c2ccb9', accent: '#dfc06f', border: '#9e8648', buttonText: '#112821' },
    ],
    frames: [
      { id: 'palace-corner', label: 'Viền góc Cung Đình' },
      { id: 'cloud-border', label: 'Khung lồng Song Hỷ' },
      { id: 'lacquer-panel', label: 'Sơn mài trang nhã' },
    ],
    motifs: [
      { id: 'double-happiness', label: 'Chữ Hỷ 囍' },
      { id: 'golden-lotus', label: 'Liên Hoa ❀' },
      { id: 'royal-knot', label: 'Kết Duyên ✤' },
    ],
  },
  'botanical-zen': {
    id: 'botanical-zen',
    name: 'Botanical Wabi-Sabi',
    tagline: 'Thảo mộc & Japandi · Kể chuyện tình yêu & Polaroid',
    description: 'Nhẹ nhàng, tự nhiên với khung ảnh Polaroid, câu chuyện tình yêu và nhịp thở thiền định thanh lịch.',
    palettes: [
      { id: 'sage-garden', name: 'Xanh Thảo Mộc', bg: '#f4f7f1', surface: '#ffffff', text: '#233020', muted: '#5d6b59', accent: '#4f6b43', border: '#b8cab0', buttonText: '#ffffff' },
      { id: 'kyoto-linen', name: 'Vải Lanh Kyoto', bg: '#f6f3eb', surface: '#fdfcf8', text: '#2c2a26', muted: '#6b665c', accent: '#8c4738', border: '#cfc7b8', buttonText: '#ffffff' },
      { id: 'terracotta-bloom', name: 'Đất Nung Ấm Áp', bg: '#faf4ee', surface: '#ffffff', text: '#2f241f', muted: '#746158', accent: '#a35b3d', border: '#dfbfb0', buttonText: '#ffffff' },
    ],
    frames: [
      { id: 'deckle-soft', label: 'Giấy xé mép tự nhiên' },
      { id: 'zen-hairline', label: 'Khung mảnh Wabi-Sabi' },
      { id: 'polaroid-mat', label: 'Bo ảnh nghệ thuật' },
    ],
    motifs: [
      { id: 'botanical-branch', label: 'Nhành thảo mộc' },
      { id: 'zen-enso', label: 'Vòng tròn Ensō · 森' },
      { id: 'wildflower-bloom', label: 'Hoa dại tinh khôi' },
    ],
  },
}

export function resolveTemplatePresetBySlug(slug: string): {
  templateId: StandardTemplateId
  paletteId: string
  frameStyle: string
  motifStyle: string
} {
  if (slug.includes('traditional') || slug.includes('hy-su')) {
    return { templateId: 'heritage-palace', paletteId: 'imperial-crimson', frameStyle: 'palace-corner', motifStyle: 'double-happiness' }
  }
  if (slug.includes('floral') || slug.includes('botanical')) {
    return { templateId: 'botanical-zen', paletteId: 'sage-garden', frameStyle: 'deckle-soft', motifStyle: 'botanical-branch' }
  }
  if (slug.includes('minimalist') || slug.includes('wabi')) {
    return { templateId: 'botanical-zen', paletteId: 'kyoto-linen', frameStyle: 'zen-hairline', motifStyle: 'zen-enso' }
  }
  if (slug.includes('typography') || slug.includes('calligraphy')) {
    return { templateId: 'editorial-vogue', paletteId: 'blush-rose', frameStyle: 'vellum-pill', motifStyle: 'monogram' }
  }
  return { templateId: 'editorial-vogue', paletteId: 'champagne-atelier', frameStyle: 'arch-dome', motifStyle: 'wax-seal' }
}

export function resolvePalette(templateId: DigitalTemplateId, paletteId?: string): PalettePreset {
  const def = TEMPLATE_DEFINITIONS[toStandardTemplateId(templateId)]
  return def.palettes.find((p) => p.id === paletteId) ?? def.palettes[0]
}

export function buildDefaultConfig(templateId: DigitalTemplateId, partial?: InvitationSeedInput['templateConfig']): ResolvedTemplateConfig {
  const def = TEMPLATE_DEFINITIONS[toStandardTemplateId(templateId)]
  const paletteValid = def.palettes.some((p) => p.id === partial?.paletteId)
  const frameValid = def.frames.some((f) => f.id === partial?.frameStyle)
  const motifValid = def.motifs.some((m) => m.id === partial?.motifStyle)
  return {
    paletteId: paletteValid && partial?.paletteId ? partial.paletteId : def.palettes[0].id,
    frameStyle: frameValid && partial?.frameStyle ? partial.frameStyle : def.frames[0].id,
    motifStyle: motifValid && partial?.motifStyle ? partial.motifStyle : def.motifs[0].id,
    showFamilies: partial?.showFamilies ?? true,
    showLunarDate: partial?.showLunarDate ?? true,
    showGallery: partial?.showGallery ?? true,
    showSchedule: partial?.showSchedule ?? true,
    showCountdown: partial?.showCountdown ?? true,
    showMapButton: partial?.showMapButton ?? true,
    showAudio: partial?.showAudio ?? true,
  }
}

export function buildInitialInvitationModel(seed?: InvitationSeedInput, fallbackSlug = 'editorial-digital-01'): DigitalInvitationModel {
  const slugPreset = resolveTemplatePresetBySlug(fallbackSlug)
  const templateId = seed?.templateId ?? slugPreset.templateId
  const baseConfig = buildDefaultConfig(templateId, {
    paletteId: seed?.templateConfig?.paletteId ?? (seed?.templateId ? undefined : slugPreset.paletteId),
    frameStyle: seed?.templateConfig?.frameStyle ?? (seed?.templateId ? undefined : slugPreset.frameStyle),
    motifStyle: seed?.templateConfig?.motifStyle ?? (seed?.templateId ? undefined : slugPreset.motifStyle),
    ...seed?.templateConfig,
  })
  const defaultGallery = ['/images/blog/personalize-couple-table.jpg', '/images/blog/style-romantic-charm.jpg', '/images/blog/style-luxury-lily.jpg']
  return {
    templateId,
    displayNames: seed?.displayNames ?? ['Quốc Bảo', 'Minh Anh'],
    coupleRoles: seed?.coupleRoles ?? ['Tân Lang · Trưởng Nam', 'Tân Nương · Ái Nữ'],
    eventTitle: seed?.eventTitle || 'Lễ Thành Hôn & Tiệc Mừng',
    greeting: seed?.greeting ?? 'Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh lớn lao trong ngày chung đôi của chúng tôi.',
    eventLocalStart: seed?.eventLocalStart ?? '20261220T180000',
    timeZone: seed?.timeZone ?? 'Asia/Ho_Chi_Minh',
    lunarDate: seed?.lunarDate ?? 'Nhằm ngày 12 tháng 11 năm Bính Ngọ',
    venueName: seed?.venueName ?? 'Grand Ballroom · Tầng 5 · White Palace',
    venueAddress: seed?.venueAddress ?? '194 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh',
    mapUrl: seed?.mapUrl ?? '',
    families: {
      groomParents: seed?.families?.groomParents ?? 'Ông Chu Đức Long · Bà Nguyễn Thị Mai',
      groomOrigin: seed?.families?.groomOrigin ?? 'Quận 1, TP. Hồ Chí Minh',
      brideParents: seed?.families?.brideParents ?? 'Ông Trần Hải Nam · Bà Lê Kim Phượng',
      brideOrigin: seed?.families?.brideOrigin ?? 'Phú Nhuận, TP. Hồ Chí Minh',
    },
    scheduleItems: seed?.scheduleItems?.length ? seed.scheduleItems : [
      { time: '17:30', label: 'Đón khách & Chụp ảnh' },
      { time: '18:30', label: 'Nghi lễ Thành Hôn' },
      { time: '19:00', label: 'Khai tiệc Chung Vui' },
    ],
    photos: {
      heroUrl: seed?.photos?.heroUrl ?? '/images/landing/hero-ivory-suite.jpg',
      galleryUrls: seed?.photos?.galleryUrls?.length ? seed.photos.galleryUrls : defaultGallery,
      storyCaption: seed?.photos?.storyCaption ?? 'Từ ánh nhìn đầu tiên giữa buổi chiều thu, chúng mình đã đi cùng nhau qua bốn mùa nắng mưa để viết tiếp chương mới.',
    },
    templateConfig: baseConfig,
    ...(seed?.customDesign ? { customDesign: seed.customDesign } : {}),
  }
}
