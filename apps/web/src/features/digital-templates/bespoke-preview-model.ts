import type { BespokeDesignBlueprint } from '@mori/contracts'
import { buildInitialInvitationModel } from './digital-template-presets'
import type { InvitationSeedInput } from './digital-template-types'

type BespokePreviewDraft = Pick<
  InvitationSeedInput,
  'coupleRoles' | 'families' | 'scheduleItems' | 'eventLocalStart' | 'lunarDate' | 'venueName' | 'venueAddress'
> & {
  displayNames: [string, string]
  eventTitle: string
  greeting?: string | undefined
  heroUrl?: string | undefined
  storyCaption?: string | undefined
}

export function buildBespokePreviewModel(
  customDesign: BespokeDesignBlueprint,
  draftData: BespokePreviewDraft,
  sessionPhotoUrl?: string,
) {
  const { heroUrl, storyCaption, ...seed } = draftData
  const effectiveHero = heroUrl || sessionPhotoUrl
  return buildInitialInvitationModel({
    ...seed,
    templateId: 'custom-ai',
    customDesign,
    photos: {
      ...(effectiveHero ? { heroUrl: effectiveHero } : {}),
      ...(storyCaption ? { storyCaption } : {}),
    },
  })
}
