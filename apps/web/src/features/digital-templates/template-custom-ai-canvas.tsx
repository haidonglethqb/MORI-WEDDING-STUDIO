'use client'

import { useMemo } from 'react'
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function sanitizeClientHtml(raw: string): string {
  return raw
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

  const srcDoc = useMemo(() => {
    const cleanHtml = interpolateBespokeTokens(sanitizeClientHtml(design.customHtml ?? ''), model)
    const cleanCss = sanitizeClientCss(design.customCss ?? '')
    const t = design.theme

    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
:root{
  --tpl-bg:${t.bg};
  --tpl-bg-accent:${t.bgAccent ?? t.bg};
  --tpl-surface:${t.surface};
  --tpl-text:${t.text};
  --tpl-muted:${t.muted};
  --tpl-accent:${t.accent};
  --tpl-border:${t.border};
  --tpl-btn-text:${t.buttonText};
}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;min-height:100%;background:${t.bg};color:${t.text};font-family:'Be Vietnam Pro',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;height:auto}
${cleanCss}
</style>
</head>
<body>${cleanHtml}</body>
</html>`
  }, [design, model])

  return (
    <div className={`bsp-canvas-stage${compact ? ' is-compact' : ''}`}>
      <iframe
        sandbox=""
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
