/** Canvas 2D vector Asian & Heritage motif drawers for Three.js textures */

export function drawPalaceJoy(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = 'bold 92px serif'
  ctx.fillText('囍', 512, 355)
  ctx.font = '700 16px -apple-system, sans-serif'
  ctx.fillText('HOÀNG GIA ĐẠI LỄ', 512, 470)
}

export function drawPhoenixGold(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(512, 360, 84, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = 'bold 72px serif'
  ctx.fillText('鳳', 512, 355)
  ctx.font = '700 16px -apple-system, sans-serif'
  ctx.fillText('PHỤNG VŨ LOAN TƯỜNG', 512, 475)
}

export function drawLotusHeritage(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = gold
  ctx.font = '68px serif'
  ctx.fillText('🪷', 512, 350)
  ctx.font = '700 16px -apple-system, sans-serif'
  ctx.fillText('DUYÊN KHỞI TRĂM NĂM', 512, 465)
}

export function drawCloudWave(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(472, 360, 36, Math.PI, 0)
  ctx.arc(552, 360, 36, Math.PI, 0)
  ctx.arc(512, 340, 48, Math.PI, 0)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.font = '700 16px -apple-system, sans-serif'
  ctx.fillText('KIM NGỌC MÃN ĐƯỜNG', 512, 465)
}

export function drawZenEnso(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.strokeStyle = gold
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(512, 360, 68, 0.2, Math.PI * 1.9)
  ctx.stroke()
  ctx.fillStyle = '#b33939'
  ctx.fillRect(492, 340, 40, 40)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px serif'
  ctx.fillText('森', 512, 360)
}

export function drawMujiHanko(ctx: CanvasRenderingContext2D, gold: string): void {
  ctx.fillStyle = '#963529'
  ctx.fillRect(482, 330, 60, 60)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px serif'
  ctx.fillText('森', 512, 360)
  ctx.fillStyle = gold
  ctx.font = '14px -apple-system, sans-serif'
  ctx.fillText('MUJI PURE ESSENCE', 512, 465)
}
