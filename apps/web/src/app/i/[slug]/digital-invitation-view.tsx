'use client'

import type { ReactNode } from 'react'
import type { PublicInvitation } from '@mori/contracts'
import { buildInitialInvitationModel } from '../../../features/digital-templates/digital-template-presets'
import { DigitalTemplateRenderer } from '../../../features/digital-templates/digital-template-renderer'

interface DigitalViewProps {
  slug: string
  invitation: PublicInvitation
  partyName?: string | null
  rsvpSection?: ReactNode
}

export function DigitalInvitationView({
  slug,
  invitation,
  partyName,
  rsvpSection,
}: DigitalViewProps) {
  const model = buildInitialInvitationModel(invitation, slug)
  const calendarHref =
    invitation.eventLocalStart && invitation.timeZone
      ? `/i/${encodeURIComponent(slug)}/calendar`
      : undefined

  return (
    <DigitalTemplateRenderer
      model={model}
      partyName={partyName}
      calendarHref={calendarHref}
      rsvpSection={rsvpSection}
    />
  )
}
