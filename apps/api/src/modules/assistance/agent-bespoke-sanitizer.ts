const MAX_HTML = 28_000
const MAX_CSS = 18_000

/**
 * Strips executable markup and external fetches while preserving bespoke HTML,
 * inline SVG artwork, CSS @keyframes animations, and the {{HERO_PHOTO}} token.
 */
export function sanitizeBespokeHtml(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  let clean = trimmed
    .replace(/<(script|iframe|object|embed|applet|meta|base|link|form|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|applet|meta|base|link|input|textarea)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\b(?:javascript|vbscript)\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/(<img\b[^>]*\bsrc\s*=\s*["'])(https?:\/\/[^"']+)(["'])/gi, '$1{{HERO_PHOTO}}$3')

  clean = clean.trim()
  if (!clean) return undefined
  return clean.slice(0, MAX_HTML)
}

export function sanitizeBespokeCss(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  let clean = trimmed
    .replace(/<\/style/gi, '')
    .replace(/@import\b[^;]*;?/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\(\s*['"]?\s*https?:\/\/[^)]+\)/gi, 'none')

  clean = clean.trim()
  if (!clean) return undefined
  return clean.slice(0, MAX_CSS)
}
