import * as THREE from 'three'
import {
  getBespokeProfile,
  type BespokeProductProfile,
} from '../../app/collections/collection-catalog-data'
import { getPreviewCoupleName } from '../../app/collections/collection-types'
import { drawCardCover } from './texture-cover-drawer'
import { drawCardInside } from './texture-inside-drawer'

const DEFAULT_FALLBACK_PROFILE: BespokeProductProfile = {
  title: "L'Amour Atelier",
  subtitle: 'Thiết kế độc bản trên nền giấy bã mía',
  silhouette: 'standard',
  cardBg: '#faf7f2',
  borderColor: '#c5a059',
  accentColor: '#b38e46',
  motifType: 'arch-vogue',
}

export function createBespokePaperTexture(
  slug = 'editorial-bifold-01',
  isCover = true,
  customCoupleName?: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1448
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const profile = getBespokeProfile(slug) ?? DEFAULT_FALLBACK_PROFILE
  const couple = customCoupleName || getPreviewCoupleName()

  if (isCover) {
    drawCardCover(ctx, profile, couple, 'Tháng 12 · 2026 · Hà Nội')
  } else {
    drawCardInside(ctx, profile, couple)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createPaperTexture(
  title: string,
  _subtitle: string,
  _details: string,
  isCover = true,
  style = 'editorial',
): THREE.CanvasTexture {
  return createBespokePaperTexture(style, isCover, title)
}

export function loadCardImageTexture(
  imageUrl: string | null | undefined,
  cardAspect: number,
  maxAnisotropy: number,
  isCancelled: () => boolean,
  onLoaded: (texture: THREE.Texture) => void,
): void {
  if (!imageUrl) return
  const loader = new THREE.TextureLoader()
  loader.load(
    imageUrl,
    (texture) => {
      if (isCancelled()) {
        texture.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = Math.min(4, maxAnisotropy)
      const img = texture.image as { width?: number; height?: number } | undefined
      if (img?.width && img?.height) {
        const imgAspect = img.width / img.height
        if (Math.abs(cardAspect - imgAspect) > 0.05) {
          if (imgAspect > cardAspect) {
            const scale = cardAspect / imgAspect
            texture.repeat.set(scale, 1)
            texture.offset.set((1 - scale) / 2, 0)
          } else {
            const scale = imgAspect / cardAspect
            texture.repeat.set(1, scale)
            texture.offset.set(0, (1 - scale) / 2)
          }
        }
      }
      onLoaded(texture)
    },
    undefined,
    () => {
      // Keep the procedural canvas texture when product image fails to load.
    },
  )
}
