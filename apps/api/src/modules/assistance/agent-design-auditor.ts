import type { BespokeDesignBlueprint, BespokeTheme } from '@mori/contracts'

export interface DesignQualityAudit {
  score: number
  wcagTextContrast: number
  wcagButtonContrast: number
  autoFixes: string[]
  checksPassed: string[]
}

const SLOP_EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
const WATERMARK_LINE_RE = /<footer\b[^>]*>[\s\S]*?(?:mori\s*bespoke|bespoke\s*ai|powered\s*by\s*ai)[\s\S]*?<\/footer>/gi

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHexRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA)
  const l2 = relativeLuminance(hexB)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
}

function pickHighContrastColor(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.35 ? '#181A17' : '#F8F6F0'
}

export function auditAndEnhanceBespokeDesign(design: BespokeDesignBlueprint): {
  design: BespokeDesignBlueprint
  audit: DesignQualityAudit
} {
  const autoFixes: string[] = []
  const checksPassed: string[] = []
  const theme: BespokeTheme = { ...design.theme }

  let textRatio = contrastRatio(theme.bg, theme.text)
  if (textRatio < 4.5) {
    theme.text = pickHighContrastColor(theme.bg)
    textRatio = contrastRatio(theme.bg, theme.text)
    autoFixes.push('Tự động nâng độ tương phản chữ chính đạt chuẩn WCAG >= 4.5:1')
  } else {
    checksPassed.push(`Tương phản chữ chính WCAG ${textRatio}:1`)
  }

  let btnRatio = contrastRatio(theme.accent, theme.buttonText)
  if (btnRatio < 4.5) {
    theme.buttonText = pickHighContrastColor(theme.accent)
    btnRatio = contrastRatio(theme.accent, theme.buttonText)
    autoFixes.push('Tự động chỉnh màu chữ nút bấm đạt tương phản >= 4.5:1')
  } else {
    checksPassed.push(`Tương phản nút bấm WCAG ${btnRatio}:1`)
  }

  let customHtml = design.customHtml
  let customCss = design.customCss

  if (customHtml) {
    const beforeHtml = customHtml
    customHtml = customHtml.replace(WATERMARK_LINE_RE, '').replace(SLOP_EMOJI_RE, '')
    if (customHtml !== beforeHtml) {
      autoFixes.push('Đã lọc bỏ watermark AI/emoji slop khỏi HTML thiệp')
    } else {
      checksPassed.push('Không chứa watermark AI hay emoji slop')
    }
    if (customHtml.includes('<svg')) checksPassed.push('Có đồ họa vector SVG sắc nét')
  }

  if (customCss) {
    if (customCss.includes('@keyframes')) checksPassed.push('Có animation CSS @keyframes mượt')
    if (!customCss.includes('prefers-reduced-motion')) {
      customCss = `${customCss}\n@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}`
      autoFixes.push('Tự động bổ sung @media (prefers-reduced-motion) chuẩn A11y')
    } else {
      checksPassed.push('Hỗ trợ prefers-reduced-motion')
    }
  }

  const score = Math.min(
    100,
    72 +
      (textRatio >= 4.5 ? 8 : 0) +
      (btnRatio >= 4.5 ? 6 : 0) +
      (customHtml?.includes('<svg') ? 7 : 0) +
      (customCss?.includes('@keyframes') ? 7 : 0),
  )

  return {
    design: {
      ...design,
      theme,
      ...(customHtml ? { customHtml } : {}),
      ...(customCss ? { customCss } : {}),
    },
    audit: {
      score,
      wcagTextContrast: textRatio,
      wcagButtonContrast: btnRatio,
      autoFixes,
      checksPassed,
    },
  }
}
