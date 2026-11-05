import type { BespokeProductProfile } from '../../app/collections/collection-catalog-data'
import { drawMotifVectorFull } from './motif-3d-drawers'

export function drawCardCover(
  ctx: CanvasRenderingContext2D,
  profile: BespokeProductProfile,
  coupleName: string,
  sampleDate: string,
): void {
  const isDark = profile.cardBg.startsWith('#6') || profile.cardBg.startsWith('#7') || profile.cardBg.startsWith('#8')
  const textColor = isDark ? '#fbf8ee' : '#222820'
  const subtextColor = isDark ? '#dfcca0' : '#6a7164'
  const gold = profile.accentColor || '#d4af37'

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1448)
  grad.addColorStop(0, profile.cardBg)
  grad.addColorStop(1, isDark ? '#4a100f' : '#f0ecdf')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 1448)

  // Paper fiber texture & gold dust flecks
  ctx.fillStyle = isDark ? 'rgba(255, 215, 0, 0.04)' : 'rgba(74, 87, 69, 0.035)'
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1448, 2, 2)
  }

  // Borders & Corner Pins
  ctx.strokeStyle = profile.borderColor
  ctx.lineWidth = 3
  ctx.strokeRect(52, 52, 920, 1344)
  ctx.strokeStyle = isDark ? 'rgba(247, 211, 109, 0.35)' : 'rgba(184, 148, 77, 0.35)'
  ctx.lineWidth = 1.2
  ctx.strokeRect(66, 66, 892, 1316)

  ctx.fillStyle = gold
  ctx.font = '22px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cornerPin = isDark ? '✦' : '✤'
  ctx.fillText(cornerPin, 78, 78)
  ctx.fillText(cornerPin, 946, 78)
  ctx.fillText(cornerPin, 78, 1370)
  ctx.fillText(cornerPin, 946, 1370)

  // Atelier Brand Header
  ctx.fillStyle = subtextColor
  ctx.font = '500 17px -apple-system, sans-serif'
  ctx.fillText('MORI WEDDING ATELIER', 512, 175)

  // Motif Drawing using full vector engine for 30 models
  drawMotifVectorFull(ctx, profile.motifType, gold, isDark)

  // Couple Names
  ctx.fillStyle = textColor
  ctx.font = '500 54px "Lora", Georgia, serif'
  ctx.fillText(coupleName || 'Minh Sơn & Thảo Vy', 512, 600)

  // Divider Bar
  ctx.strokeStyle = gold
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(380, 650)
  ctx.lineTo(644, 650)
  ctx.stroke()

  // Tagline & Date
  const isHeritage = isDark || profile.motifType.includes('palace') || profile.motifType.includes('phoenix')
  ctx.fillStyle = gold
  ctx.font = '600 24px -apple-system, sans-serif'
  ctx.fillText(isHeritage ? 'TRĂM NĂM HẠNH PHÚC' : 'SAVE THE DATE', 512, 715)

  ctx.fillStyle = textColor
  ctx.font = '30px "Lora", Georgia, serif'
  ctx.fillText(sampleDate || 'Tháng 12 · 2026 · Hà Nội', 512, 850)

  // Bottom Craft Seal
  ctx.font = 'italic 19px Georgia, serif'
  ctx.fillStyle = subtextColor
  ctx.fillText('Giấy bã mía sinh thái 350gsm · Ép kim nhiệt cao', 512, 1260)
}
