import { VOGUE_FLORAL_PROFILES } from './collection-profiles-vogue-floral'
import { HERITAGE_ZEN_PROFILES } from './collection-profiles-heritage-zen'
import { SECONDARY_PROFILES } from './collection-catalog-secondary'

export { getProductImageUrl, resolveProductImageUrl } from './product-image-url'

export type CardSilhouette = 'arch' | 'standard' | 'deckle' | 'vellum'

export interface BespokeProductProfile {
  title: string
  subtitle: string
  silhouette: CardSilhouette
  cardBg: string
  borderColor: string
  accentColor: string
  motifType:
    | 'arch-vogue'
    | 'roman-vogue'
    | 'vellum-couture'
    | 'baroque-crest'
    | 'magnolia-spray'
    | 'eucalyptus-twin'
    | 'meadow-wildflowers'
    | 'laurel-wreath'
    | 'palace-joy'
    | 'phoenix-gold'
    | 'lotus-heritage'
    | 'cloud-wave'
    | 'zen-enso'
    | 'muji-hanko'
    | 'stone-frame'
    | 'horizon-arch'
    | 'florence-script'
    | 'serenade-ribbon'
    | 'artisan-press'
    | 'golden-swirl'
    | 'nordic-arch'
    | 'celestial-halo'
    | 'signature-atelier'
}

export const BESPOKE_PROFILES: Record<string, BespokeProductProfile> = {
  ...VOGUE_FLORAL_PROFILES,
  ...HERITAGE_ZEN_PROFILES,
  ...SECONDARY_PROFILES,
}

export function getBespokeProfile(slug: string): BespokeProductProfile | undefined {
  return BESPOKE_PROFILES[slug]
}
