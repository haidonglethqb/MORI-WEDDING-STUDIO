'use client'

import { useMemo, type CSSProperties } from 'react'
import type { BespokeDesignBlueprint } from '@mori/contracts'
import type { DigitalInvitationModel } from './digital-template-types'
import { TemplateUtilityRow } from './template-actions-bar'
import { parseEventDate, resolveGoogleMapsHref } from './template-view-utils'

interface Props {
  model: DigitalInvitationModel
  design: BespokeDesignBlueprint
  calendarHref?: string | undefined
  compact?: boolean | undefined
}

const VIETNAMESE_FONT_FACES = `
@font-face{font-family:'Lora';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/lora-normal-400-vietnamese.woff2) format('woff2'),url(/fonts/lora-normal-400-latin.woff2) format('woff2')}
@font-face{font-family:'Lora';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/lora-normal-500-vietnamese.woff2) format('woff2'),url(/fonts/lora-normal-500-latin.woff2) format('woff2')}
@font-face{font-family:'Lora';font-style:italic;font-weight:400;font-display:swap;src:url(/fonts/lora-italic-400-vietnamese.woff2) format('woff2'),url(/fonts/lora-italic-400-latin.woff2) format('woff2')}
@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/be-vietnam-pro-normal-400-vietnamese.woff2) format('woff2'),url(/fonts/be-vietnam-pro-normal-400-latin.woff2) format('woff2')}
@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/be-vietnam-pro-normal-500-vietnamese.woff2) format('woff2'),url(/fonts/be-vietnam-pro-normal-500-latin.woff2) format('woff2')}
@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:600;font-display:swap;src:url(/fonts/be-vietnam-pro-normal-600-vietnamese.woff2) format('woff2'),url(/fonts/be-vietnam-pro-normal-600-latin.woff2) format('woff2')}
`

function escapeHtml(value: string): string {
  return value
    .normalize('NFC')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function sanitizeClientHtml(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/<(script|iframe|object|embed|applet|meta|base|link|form|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|applet|meta|base|link|input|textarea)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\b(?:javascript|vbscript)\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
}

function sanitizeClientCss(raw: string): string {
  return raw
    .replace(/<\/style/gi, '')
    .replace(/@import\b[^;]*;?/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\(\s*['"]?\s*https?:\/\/[^)]+\)/gi, 'none')
    .replace(/\bGeorgia\b/gi, "'Lora', 'Times New Roman'")
}

export function interpolateBespokeTokens(html: string, model: DigitalInvitationModel): string {
  const parsedDate = parseEventDate(model.eventLocalStart)
  const dateDisplay = parsedDate ? `${parsedDate.viDateLine} · ${parsedDate.hour}:${parsedDate.minute}` : ''
  const safeHero =
    model.photos.heroUrl &&
    (model.photos.heroUrl.startsWith('data:image/') || model.photos.heroUrl.startsWith('/images/'))
      ? model.photos.heroUrl
      : ''

  let out = html
    .replace(/\{\{GROOM_NAME\}\}/g, escapeHtml(model.displayNames[0]))
    .replace(/\{\{BRIDE_NAME\}\}/g, escapeHtml(model.displayNames[1]))
    .replace(/\{\{EVENT_TITLE\}\}/g, escapeHtml(model.eventTitle))
    .replace(/\{\{GREETING\}\}/g, escapeHtml(model.greeting))
    .replace(/\{\{DATE_DISPLAY\}\}/g, escapeHtml(dateDisplay))
    .replace(/\{\{LUNAR_DATE\}\}/g, escapeHtml(model.lunarDate))
    .replace(/\{\{VENUE_NAME\}\}/g, escapeHtml(model.venueName))
    .replace(/\{\{VENUE_ADDRESS\}\}/g, escapeHtml(model.venueAddress))

  if (safeHero) {
    out = out.replace(/\{\{HERO_PHOTO\}\}/g, safeHero)
  } else {
    out = out.replace(/<img\b[^>]*\{\{HERO_PHOTO\}\}[^>]*\/?>/gi, '').replace(/\{\{HERO_PHOTO\}\}/g, '')
  }
  return out
}

export function TemplateCustomAiCanvas({ model, design, calendarHref, compact }: Props) {
  const mapHref = resolveGoogleMapsHref(model.mapUrl, model.venueName, model.venueAddress)
  const cfg = model.templateConfig
  const t = design.theme

  const utilityVars = {
    '--tpl-bg': '#F7F4EC',
    '--tpl-surface': '#FFFFFF',
    '--tpl-text': '#1F241C',
    '--tpl-muted': '#5E6658',
    '--tpl-accent': '#4A5934',
    '--tpl-border': '#DCD5C6',
    '--tpl-btn-text': '#FFFFFF',
  } as CSSProperties

  const srcDoc = useMemo(() => {
    const cleanHtml = interpolateBespokeTokens(sanitizeClientHtml(design.customHtml ?? ''), model)
    const cleanCss = sanitizeClientCss(design.customCss ?? '')

    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
${VIETNAMESE_FONT_FACES}
:root{
  --tpl-bg:${t.bg};--tpl-bg-accent:${t.bgAccent ?? t.bg};--tpl-surface:${t.surface};
  --tpl-text:${t.text};--tpl-muted:${t.muted};--tpl-accent:${t.accent};
  --tpl-border:${t.border};--tpl-btn-text:${t.buttonText};
  --kit-primary:${t.accent};--kit-secondary:${t.border};
}
*,*::before,*::after{box-sizing:border-box}
html{scrollbar-width:thin;scrollbar-color:${t.border} transparent}
html::-webkit-scrollbar{width:5px;height:5px}
html::-webkit-scrollbar-track{background:transparent}
html::-webkit-scrollbar-thumb{background:${t.border};border-radius:999px}
html,body{margin:0;padding:0;min-height:100%;background:${t.bg};color:${t.text};font-family:'Be Vietnam Pro','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3,blockquote{font-family:'Lora','Times New Roman',serif}
img{max-width:100%;height:auto}
${cleanCss}
</style>
</head>
<body>${cleanHtml}</body>
</html>`
  }, [design, model, t])

  return (
    <div className={`bsp-canvas-stage${compact ? ' is-compact' : ''}`} style={utilityVars}>
      <iframe
        sandbox="allow-same-origin"
        srcDoc={srcDoc}
        title={design.conceptName}
        className="bsp-live-canvas-frame"
      />
      <TemplateUtilityRow
        showMapButton={cfg.showMapButton && Boolean(model.venueName || model.venueAddress || model.mapUrl)}
        mapHref={mapHref}
        calendarHref={calendarHref}
        showAudio={cfg.showAudio}
      />
    </div>
  )
}
