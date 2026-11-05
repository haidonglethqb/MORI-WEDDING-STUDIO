import type { BespokeProductProfile } from '../../app/collections/collection-catalog-data'

export function drawCardInside(
  ctx: CanvasRenderingContext2D,
  profile: BespokeProductProfile,
  coupleName: string,
): void {
  const isHeritage =
    profile.cardBg.startsWith('#6') ||
    profile.cardBg.startsWith('#7') ||
    profile.cardBg.startsWith('#8')
  const isVogue = profile.motifType.includes('vogue') || profile.motifType.includes('arch')
  const isZen = profile.motifType.includes('enso') || profile.motifType.includes('hanko')
  const gold = profile.accentColor || '#d4af37'
  const textColor = '#222820'
  const mutedColor = '#6a7164'

  // Warm fine parchment inner background
  const grad = ctx.createLinearGradient(0, 0, 1024, 1448)
  grad.addColorStop(0, '#fdfbf7')
  grad.addColorStop(0.5, '#f9f6ed')
  grad.addColorStop(1, '#f2eee0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 1448)

  // Paper grain flecks
  ctx.fillStyle = 'rgba(74, 87, 69, 0.03)'
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * 1024, Math.random() * 1448, 2, 2)
  }

  // Border & Hairline
  ctx.strokeStyle = isHeritage ? '#a84c38' : gold
  ctx.lineWidth = 2.5
  ctx.strokeRect(52, 52, 920, 1344)
  ctx.strokeStyle = isHeritage ? 'rgba(168,76,56,0.3)' : 'rgba(184,148,77,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(66, 66, 892, 1316)

  // Corner symbols
  ctx.fillStyle = isHeritage ? '#a84c38' : gold
  ctx.font = '20px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const pin = isHeritage ? '囍' : isVogue ? '⚜' : '✤'
  ctx.fillText(pin, 78, 78)
  ctx.fillText(pin, 946, 78)
  ctx.fillText(pin, 78, 1370)
  ctx.fillText(pin, 946, 1370)

  // Main Invitation Title
  ctx.fillStyle = isHeritage ? '#8a241f' : '#334430'
  ctx.font = '600 36px "Lora", Georgia, serif'
  const title = isHeritage
    ? 'THIỆP HỒNG BÁO HỶ'
    : isVogue
      ? 'RÉCEPTION DE MARIAGE'
      : 'TRÂN TRỌNG KÍNH MỜI'
  ctx.fillText(title, 512, 270)

  // Subtitle / Lead phrase
  ctx.fillStyle = mutedColor
  ctx.font = '22px -apple-system, sans-serif'
  const lead = isHeritage
    ? 'Kính mời quý khách tới dự bữa cơm thân mật chung vui cùng hai gia đình'
    : isZen
      ? 'Chung vui khoảnh khắc an yên và gắn kết trọn đời'
      : 'Đến dự buổi tiệc thân mật mừng ngày chung đôi của'
  ctx.fillText(lead, 512, 360)

  // Couple Names
  ctx.fillStyle = textColor
  ctx.font = 'italic 54px "Lora", Georgia, serif'
  ctx.fillText(coupleName || 'Minh Sơn & Thảo Vy', 512, 480)

  // Ornamental Divider
  ctx.strokeStyle = gold
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(420, 540)
  ctx.lineTo(604, 540)
  ctx.stroke()
  ctx.fillStyle = gold
  ctx.fillText(isHeritage ? '囍' : '✦', 512, 540)

  // Ceremony Details
  ctx.fillStyle = textColor
  ctx.font = '600 24px -apple-system, sans-serif'
  ctx.fillText('HÔN LỄ ĐƯỢC CỬ HÀNH VÀO LÚC 18:00', 512, 650)

  ctx.font = '28px "Lora", Georgia, serif'
  ctx.fillStyle = isHeritage ? '#8a241f' : '#2b3327'
  ctx.fillText('Thứ Bảy · Ngày 12 Tháng 12 Năm 2026', 512, 710)

  ctx.fillStyle = mutedColor
  ctx.font = '21px -apple-system, sans-serif'
  const subCal = isHeritage
    ? '(Tức ngày 04 tháng 11 năm Bính Ngọ · Hoàng Đạo Cát Nhật)'
    : isVogue
      ? 'XII · XII · MMXXVI · Salle de Bal'
      : '(Tức ngày 04 tháng 11 năm Bính Ngọ)'
  ctx.fillText(subCal, 512, 760)

  // Venue Details
  ctx.fillStyle = textColor
  ctx.font = '600 26px -apple-system, sans-serif'
  ctx.fillText('TRUNG TÂM HỘI NGHỊ QUỐC GIA & KS DAEWOO', 512, 890)

  ctx.font = '22px -apple-system, sans-serif'
  ctx.fillStyle = mutedColor
  ctx.fillText('360 Kim Mã, Quận Ba Đình, TP. Hà Nội', 512, 940)

  // Closing family note
  ctx.fillStyle = isHeritage ? '#8a241f' : '#55634f'
  ctx.font = 'italic 23px "Lora", Georgia, serif'
  ctx.fillText('Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình', 512, 1140)

  // Atelier watermark seal
  ctx.fillStyle = 'rgba(184, 148, 77, 0.4)'
  ctx.font = '500 15px -apple-system, sans-serif'
  ctx.fillText('MORI WEDDING ATELIER · 100% TREE-FREE FIBER', 512, 1270)
}
