'use client'

import type { ReactNode } from 'react'
import { resolvePalette } from './digital-template-presets'
import type { DigitalInvitationModel } from './digital-template-types'
import { TemplateBotanicalZen } from './template-botanical-zen'
import { TemplateCustomAi } from './template-custom-ai'
import { TemplateEditorialVogue } from './template-editorial-vogue'
import { TemplateHeritagePalace } from './template-heritage-palace'

interface RendererProps {
  model: DigitalInvitationModel
  partyName?: string | null | undefined
  calendarHref?: string | undefined
  rsvpSection?: ReactNode
  compact?: boolean | undefined
}

export function DigitalTemplateRenderer({
  model,
  partyName,
  calendarHref,
  rsvpSection,
  compact,
}: RendererProps) {
  const palette = resolvePalette(model.templateId, model.templateConfig.paletteId)

  return (
    <div className={`mori-tpl-stage${compact ? ' is-compact' : ''}`}>
      {model.templateId === 'custom-ai' && model.customDesign ? (
        <TemplateCustomAi
          model={model}
          design={model.customDesign}
          partyName={partyName}
          calendarHref={calendarHref}
          compact={compact}
        />
      ) : null}

      {model.templateId === 'editorial-vogue' || (model.templateId === 'custom-ai' && !model.customDesign) ? (
        <TemplateEditorialVogue
          model={model}
          palette={palette}
          partyName={partyName}
          calendarHref={calendarHref}
        />
      ) : null}

      {model.templateId === 'heritage-palace' ? (
        <TemplateHeritagePalace
          model={model}
          palette={palette}
          partyName={partyName}
          calendarHref={calendarHref}
        />
      ) : null}

      {model.templateId === 'botanical-zen' ? (
        <TemplateBotanicalZen
          model={model}
          palette={palette}
          partyName={partyName}
          calendarHref={calendarHref}
        />
      ) : null}

      {rsvpSection}
    </div>
  )
}
