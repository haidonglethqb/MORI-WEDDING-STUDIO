import type {
  InvitationFamilies,
  InvitationPhotos,
  InvitationScheduleItem,
  InvitationTemplateConfig,
  InvitationTemplateId,
} from '@mori/contracts'

export type DigitalTemplateId = InvitationTemplateId

export interface PalettePreset {
  id: string
  name: string
  bg: string
  surface: string
  text: string
  muted: string
  accent: string
  border: string
  buttonText: string
}

export interface ChoiceOption {
  id: string
  label: string
}

export interface TemplateDefinition {
  id: DigitalTemplateId
  name: string
  tagline: string
  description: string
  palettes: [PalettePreset, ...PalettePreset[]]
  frames: [ChoiceOption, ...ChoiceOption[]]
  motifs: [ChoiceOption, ...ChoiceOption[]]
}

export interface PhotoPreset {
  id: string
  label: string
  url: string
}

export interface ResolvedTemplateConfig {
  paletteId: string
  frameStyle: string
  motifStyle: string
  showFamilies: boolean
  showLunarDate: boolean
  showGallery: boolean
  showSchedule: boolean
  showCountdown: boolean
  showMapButton: boolean
  showAudio: boolean
}

export interface DigitalInvitationModel {
  templateId: DigitalTemplateId
  displayNames: [string, string]
  coupleRoles: [string, string]
  eventTitle: string
  greeting: string
  eventLocalStart: string
  timeZone: string
  lunarDate: string
  venueName: string
  venueAddress: string
  mapUrl: string
  families: {
    groomParents: string
    groomOrigin: string
    brideParents: string
    brideOrigin: string
  }
  scheduleItems: InvitationScheduleItem[]
  photos: {
    heroUrl: string
    galleryUrls: string[]
    storyCaption: string
  }
  templateConfig: ResolvedTemplateConfig
}

export interface InvitationSeedInput {
  templateId?: DigitalTemplateId | undefined
  displayNames?: [string, string] | undefined
  coupleRoles?: [string, string] | undefined
  eventTitle?: string | undefined
  greeting?: string | null | undefined
  eventLocalStart?: string | undefined
  timeZone?: string | undefined
  lunarDate?: string | undefined
  venueName?: string | undefined
  venueAddress?: string | undefined
  mapUrl?: string | undefined
  families?: InvitationFamilies | undefined
  scheduleItems?: InvitationScheduleItem[] | undefined
  photos?: InvitationPhotos | undefined
  templateConfig?: InvitationTemplateConfig | undefined
}
