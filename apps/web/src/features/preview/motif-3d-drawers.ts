/** Canvas 2D vector motif rendering for Three.js 3D paper textures */
import {
  drawPalaceJoy,
  drawPhoenixGold,
  drawLotusHeritage,
  drawCloudWave,
  drawZenEnso,
  drawMujiHanko,
} from './motif-3d-heritage'

export function drawMotifVectorFull(
  ctx: CanvasRenderingContext2D,
  motif: string,
  gold: string,
  isDark: boolean,
): void {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  switch (motif) {
    case 'phoenix-gold':
      drawPhoenixGold(ctx, gold)
      break
    case 'palace-joy':
      drawPalaceJoy(ctx, gold)
      break
    case 'lotus-heritage':
      drawLotusHeritage(ctx, gold)
      break
    case 'cloud-wave':
      drawCloudWave(ctx, gold)
      break
    case 'zen-enso':
      drawZenEnso(ctx, gold)
      break
    case 'muji-hanko':
      drawMujiHanko(ctx, gold)
      break
    case 'magnolia-spray':
    case 'floral':
      drawMagnoliaSpray(ctx, gold)
      break
    case 'eucalyptus-twin':
      drawEucalyptusTwin(ctx, gold)
      break
    case 'laurel-wreath':
      drawLaurelWreath(ctx, gold)
      break
    case 'roman-vogue':
      drawRomanVogue(ctx, gold)
      break
    case 'baroque-crest':
      drawBaroqueCrest(ctx, gold)
      break
    case 'florence-script':
    case 'calligraphy':
      drawFlorenceScript(ctx, gold)
      break
    case 'celestial-halo':
      drawCelestialHalo(ctx, gold)
      break
    case 'nordic-arch':
    case 'arch-vogue':
    case 'arch':
      drawArchFrame(ctx, gold)
      break
    default:
      drawDefaultMonogramCrest(ctx, gold, isDark)
      break
  }

  ctx.restore()
}

function drawMagnoliaSpray(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(432, 375)
  ctx.bezierCurveTo(472, 340, 552, 340, 592, 375)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.beginPath()
  ctx.arc(512, 348, 8, 0, Math.PI * 2)
  ctx.arc(460, 362, 5, 0, Math.PI * 2)
  ctx.arc(564, 362, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = 'italic 16px Georgia, serif'
  ctx.fillText('Provence Magnolia', 512, 465)
}

function drawEucalyptusTwin(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(440, 380)
  ctx.lineTo(584, 380)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = '36px serif'
  ctx.fillText('🌿', 512, 345)
  ctx.font = '15px -apple-system, sans-serif'
  ctx.fillText('Eucalyptus Botanical', 512, 465)
}

function drawLaurelWreath(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(512, 360, 68, 0.4, Math.PI * 2 - 0.4)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = 'italic 36px "Lora", serif'
  ctx.fillText('M', 512, 362)
}

function drawRomanVogue(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = '600 24px "Lora", serif'
  ctx.fillText('XII · XII · MMXXVI', 512, 350)
  ctx.strokeStyle = gold
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(420, 390)
  ctx.lineTo(604, 390)
  ctx.stroke()
  ctx.font = '700 13px -apple-system, sans-serif'
  ctx.fillText('PARIS HAUTE COUTURE', 512, 465)
}

function drawBaroqueCrest(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = '600 60px serif'
  ctx.fillText('⚜', 512, 350)
  ctx.font = '700 15px -apple-system, sans-serif'
  ctx.fillText('ÉLYSÉE BAROQUE ROYAL', 512, 465)
}

function drawFlorenceScript(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = 'italic 52px "Lora", serif'
  ctx.fillText('M ♡ T', 512, 350)
  ctx.font = '15px Georgia, serif'
  ctx.fillText('Florence Monogram', 512, 465)
}

function drawCelestialHalo(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = '28px serif'
  ctx.fillText('☽ ✦ ☾', 512, 350)
  ctx.font = '700 14px -apple-system, sans-serif'
  ctx.fillText('CELESTIAL HARMONY', 512, 465)
}

function drawArchFrame(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(512, 345, 66, Math.PI, 0)
  ctx.lineTo(578, 415)
  ctx.lineTo(446, 415)
  ctx.closePath()
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = '600 14px -apple-system, sans-serif'
  ctx.fillText('NORDIC ARCH ATELIER', 512, 465)
}

function drawDefaultMonogramCrest(
  ctx: CanvasRenderingContext2D,
  gold: string,
  isDark: boolean,
): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(512, 360, 68, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = 'italic 44px "Lora", Georgia, serif'
  ctx.fillText(isDark ? '囍' : 'M · S', 512, 362)
}
