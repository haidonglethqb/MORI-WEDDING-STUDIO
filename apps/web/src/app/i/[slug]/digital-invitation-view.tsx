'use client'

import { useState, type ReactNode } from 'react'
import { resolveModelProfile, type DigitalModelProfile } from './invitation-model-profiles'
import { InvitationStyleSwitcher } from './invitation-style-switcher'
import { EditorialVogueTemplate } from './templates/editorial-vogue-template'
import { HeritageAsianTemplate } from './templates/heritage-asian-template'
import { FloralBotanicalTemplate } from './templates/floral-botanical-template'
import { MinimalistZenTemplate } from './templates/minimalist-zen-template'
import { ModernCalligraphyTemplate } from './templates/modern-calligraphy-template'
import { ArchitecturalModernTemplate } from './templates/architectural-modern-template'

interface DigitalViewProps {
  initialSlug: string
  displayNames: [string, string]
  eventTitle: string
  greeting: string | null
  partyName?: string | null
  rsvpSection?: ReactNode
}

export function DigitalInvitationView({
  initialSlug,
  displayNames,
  eventTitle,
  greeting,
  partyName,
  rsvpSection,
}: DigitalViewProps) {
  const [profile, setProfile] = useState<DigitalModelProfile>(() => resolveModelProfile(initialSlug))
  const venue = 'InterContinental Hanoi Landmark72, Nam Từ Liêm'

  function renderBespokeTemplate() {
    const props = {
      profile,
      displayNames,
      eventTitle,
      greeting,
      partyName: partyName ?? null,
      venue,
    }

    switch (profile.style) {
      case 'editorial':
        return <EditorialVogueTemplate {...props} />
      case 'traditional':
        return <HeritageAsianTemplate {...props} />
      case 'floral':
        return <FloralBotanicalTemplate {...props} />
      case 'minimalist':
        return <MinimalistZenTemplate {...props} />
      case 'typography':
        return <ModernCalligraphyTemplate {...props} />
      case 'modern':
      default:
        return <ArchitecturalModernTemplate {...props} />
    }
  }

  return (
    <div className={`digital-invitation-stage theme-${profile.style} sil-${profile.silhouette}`}>
      {renderBespokeTemplate()}

      {/* RSVP Section */}
      {rsvpSection}

      {/* Floating 30-Model Style Switcher */}
      <InvitationStyleSwitcher currentModel={profile} onSelect={setProfile} />
    </div>
  )
}
