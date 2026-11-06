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
