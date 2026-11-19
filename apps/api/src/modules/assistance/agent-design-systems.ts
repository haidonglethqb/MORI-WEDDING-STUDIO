import type { BespokeTheme } from '@mori/contracts'

export interface ProMaxDesignSystem {
  id: string
  name: string
  keywords: string[]
  typography: 'editorial-serif' | 'modern-sans' | 'romantic-italic' | 'heritage-classic'
  frameStyle: 'arch-dome' | 'sharp-magazine' | 'glass-card' | 'imperial-corner' | 'polaroid-mat' | 'soft-organic'
  bgPattern: 'none' | 'linen-grain' | 'starry-dots' | 'botanical-wash' | 'gold-aura'
  ornament: 'wax-seal' | 'botanical-branch' | 'double-happiness' | 'constellation' | 'minimal-line' | 'zen-enso'
  heroLayout: 'arch-portrait' | 'full-overlay' | 'split-editorial' | 'polaroid-story'
  theme: BespokeTheme
  fontStack: { display: string; body: string }
  cssRecipe: string
  antiPatterns: string[]
}

const ANTI_SLOP_CORE = [
  'Không dùng emoji (✨🎉💍❤️) làm icon trang trí — dùng SVG mảnh sắc nét',
  'Không lặp lại cùng một kiểu khung hộp bo góc cho mọi section — xen kẽ bố cục mở, đường kẻ hairline và 1 khung tiêu điểm chính',
  'Không in chữ MORI, AI, Bespoke hay watermark thương hiệu lên thiệp cưới',
  'Chỉ animate transform và opacity (GPU-accelerated), tốc độ mượt 4s–14s cho chuyển động nền',
]

export const PRO_MAX_DESIGN_SYSTEMS: readonly ProMaxDesignSystem[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon Couture',
    keywords: ['cyberpunk', 'cyber', 'neon', 'futuristic', 'sci-fi', 'synthwave', 'hologram', 'tech', 'tương lai', 'đèn neon', 'glitch'],
    typography: 'modern-sans',
    frameStyle: 'glass-card',
    bgPattern: 'starry-dots',
    ornament: 'constellation',
    heroLayout: 'full-overlay',
    theme: { bg: '#070914', bgAccent: '#130B24', surface: '#11162B', text: '#F2F6FF', muted: '#9DB2D6', accent: '#00E5FF', border: '#2A3F6E', buttonText: '#06101D' },
    fontStack: { display: "'Be Vietnam Pro', 'Segoe UI', sans-serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Nền đen sâu #070914 + góc vát chamfered clip-path + ánh sáng neon cyan #00E5FF và magenta #FF2A85 tiết chế (text-shadow nhẹ 0 0 14px, không chói gắt), lưới phối cảnh mờ phía sau, viền 1px bán trong suốt.',
    antiPatterns: ['Không dùng nền tím nhòe rẻ tiền; giữ nền tối sâu để ánh sáng neon sang trọng', ...ANTI_SLOP_CORE],
  },
  {
    id: 'imperial-heritage',
    name: 'Hoàng Gia Song Hỷ Á Đông',
    keywords: ['trung hoa', 'truyền thống', 'song hỷ', 'cung đình', 'đỏ', 'rồng', 'phượng', 'hoàng gia', 'á đông', 'heritage', 'crimson', 'long phụng'],
    typography: 'heritage-classic',
    frameStyle: 'imperial-corner',
    bgPattern: 'gold-aura',
    ornament: 'double-happiness',
    heroLayout: 'arch-portrait',
    theme: { bg: '#4E0D11', bgAccent: '#34070A', surface: '#631419', text: '#FFF6E8', muted: '#E5CFAF', accent: '#E5BE67', border: '#C79B46', buttonText: '#3A090B' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Nền đỏ sơn mài trầm #4E0D11 chuyển sắc tối viền, khung đôi chỉ vàng #E5BE67 với họa tiết góc cung đình tinh xảo, dấu ấn Song Hỷ khắc nổi, tỷ lệ chữ lớn trang trọng.',
    antiPatterns: ['Không dùng đỏ tươi #FF0000 gây chói mắt; dùng đỏ rượu vang/sơn mài trầm phối vàng champagne', ...ANTI_SLOP_CORE],
  },
  {
    id: 'editorial-vogue',
    name: 'Editorial Vogue Haute Papeterie',
    keywords: ['editorial', 'vogue', 'tạp chí', 'sang trọng', 'paris', 'luxury', 'hiện đại', 'couture', 'ngà', 'champagne'],
    typography: 'editorial-serif',
    frameStyle: 'sharp-magazine',
    bgPattern: 'linen-grain',
    ornament: 'wax-seal',
    heroLayout: 'split-editorial',
    theme: { bg: '#FAF6EE', bgAccent: '#EFE8DA', surface: '#FFFFFF', text: '#1A1D19', muted: '#5F645B', accent: '#9B7834', border: '#D7CCB7', buttonText: '#FFFDF8' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Giấy mỹ thuật ngà mịn, masthead tạp chí trên cùng với đường kẻ 1px sắc nét, tên Dâu Rể cỡ lớn 40px+ cân bằng khoảng trắng rộng rãi, không đổ bóng nặng.',
    antiPatterns: ['Không nhồi nhét hiệu ứng rườm rà; sức mạnh đến từ typography và khoảng trắng', ...ANTI_SLOP_CORE],
  },
  {
    id: 'midnight-starlight',
    name: 'Đêm Sao & Cực Quang Lãng Mạn',
    keywords: ['đêm sao', 'đà lạt', 'sao trời', 'bầu trời', 'tối', 'navy', 'xanh đen', 'star', 'midnight', 'aurora', 'cực quang', 'lãng mạn'],
    typography: 'romantic-italic',
    frameStyle: 'glass-card',
    bgPattern: 'starry-dots',
    ornament: 'constellation',
    heroLayout: 'full-overlay',
    theme: { bg: '#0B1324', bgAccent: '#162542', surface: '#121E36', text: '#F4EFE6', muted: '#AEBED6', accent: '#E2C275', border: '#2E4368', buttonText: '#0B1324' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Nền xanh đêm sâu với ánh sáng cực quang dịu phía đỉnh, tinh tú 4 cánh nhấp nháy chậm 4s–7s, chữ nghiêng serif mềm mại màu kem trăng, panel kính mờ nhẹ.',
    antiPatterns: ['Không làm nền xanh nhạt thiếu chiều sâu; giữ tương phản chữ kem trên nền đêm >= 10:1', ...ANTI_SLOP_CORE],
  },
  {
    id: 'sakura-kyoto',
    name: 'Washi Hoa Anh Đào Nhật Bản',
    keywords: ['nhật', 'anh đào', 'sakura', 'hồng', 'pastel', 'mùa xuân', 'blossom', 'hoa rơi', 'nhẹ nhàng', 'dễ thương'],
    typography: 'romantic-italic',
    frameStyle: 'soft-organic',
    bgPattern: 'botanical-wash',
    ornament: 'zen-enso',
    heroLayout: 'arch-portrait',
    theme: { bg: '#FDF6F7', bgAccent: '#F6E8EC', surface: '#FFFFFF', text: '#341E25', muted: '#7A5863', accent: '#B8536B', border: '#E4C7CF', buttonText: '#FFFFFF' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Giấy washi hồng phấn rất dịu, cánh hoa anh đào SVG rơi chéo chậm 8s–14s nhẹ nhàng, nhấn mực mận trầm #341E25 sắc nét, không dùng hồng neon gắt.',
    antiPatterns: ['Không dùng chữ màu hồng nhạt trên nền hồng (kém tương phản); chữ chính phải là mực mận đậm', ...ANTI_SLOP_CORE],
  },
  {
    id: 'botanical-wabi',
    name: 'Thảo Mộc Wabi-Sabi Sân Vườn',
    keywords: ['sân vườn', 'thảo mộc', 'garden', 'botanical', 'xanh lá', 'olive', 'wabi', 'zen', 'tự nhiên', 'rustic', 'mộc'],
    typography: 'editorial-serif',
    frameStyle: 'polaroid-mat',
    bgPattern: 'botanical-wash',
    ornament: 'botanical-branch',
    heroLayout: 'polaroid-story',
    theme: { bg: '#F4F2EA', bgAccent: '#E8E5D8', surface: '#FCFBF7', text: '#222C1F', muted: '#5D6857', accent: '#4F6943', border: '#CED4C2', buttonText: '#FFFFFF' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Nền vải lanh ấm, đường nét cành lá mảnh chuyển động khẽ theo gió, khung ảnh Polaroid bo giấy mỹ thuật, bảng màu xanh olive trầm thanh lịch.',
    antiPatterns: ['Không dùng màu xanh lá tươi kiểu công nghiệp; dùng xanh thảo mộc/olive tự nhiên', ...ANTI_SLOP_CORE],
  },
  {
    id: 'art-deco-gatsby',
    name: 'Art Deco Gatsby Hoàng Kim',
    keywords: ['art deco', 'gatsby', '1920', 'vàng đen', 'đen vàng', 'black gold', 'lấp lánh', 'xa hoa', 'khách sạn', 'ballroom'],
    typography: 'heritage-classic',
    frameStyle: 'imperial-corner',
    bgPattern: 'gold-aura',
    ornament: 'minimal-line',
    heroLayout: 'arch-portrait',
    theme: { bg: '#0E1014', bgAccent: '#181C22', surface: '#161920', text: '#F6EFE0', muted: '#BDB39E', accent: '#D8B458', border: '#8D7438', buttonText: '#0E1014' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Đen onyx kết hợp khung hình học Art Deco đối xứng tia vàng đồng, đường chỉ kép chính xác, ánh sáng vàng kim quét nhẹ 6s.',
    antiPatterns: ['Không bo tròn quá mức ở phong cách Art Deco; ưu tiên góc sắc, bậc thang và đường hình học', ...ANTI_SLOP_CORE],
  },
  {
    id: 'coastal-sunset',
    name: 'Biển Hoàng Hôn Resort',
    keywords: ['biển', 'beach', 'hoàng hôn', 'sunset', 'resort', 'phú quốc', 'đà nẵng', 'nha trang', 'sóng', 'terracotta', 'cam đất'],
    typography: 'editorial-serif',
    frameStyle: 'arch-dome',
    bgPattern: 'gold-aura',
    ornament: 'minimal-line',
    heroLayout: 'arch-portrait',
    theme: { bg: '#FBF5EE', bgAccent: '#F2E4D6', surface: '#FFFFFF', text: '#29201B', muted: '#746055', accent: '#BC5F3D', border: '#DFC4B2', buttonText: '#FFFFFF' },
    fontStack: { display: "Georgia, 'Times New Roman', serif", body: "'Be Vietnam Pro', system-ui, sans-serif" },
    cssRecipe: 'Nền cát ấm chuyển ánh hoàng hôn dịu, sóng SVG lăn tăn chậm ở chân trang, khung vòm Địa Trung Hải thanh thoát.',
    antiPatterns: ['Không dùng xanh dương chói giả tạo; giữ sắc cát, cam đất và xanh biển dịu', ...ANTI_SLOP_CORE],
  },
]

export function searchDesignSystem(query: string, mood = ''): ProMaxDesignSystem {
  const hay = `${query} ${mood}`.toLowerCase()
  let best = PRO_MAX_DESIGN_SYSTEMS[2] as ProMaxDesignSystem
  let bestScore = -1

  for (const sys of PRO_MAX_DESIGN_SYSTEMS) {
    let score = 0
    for (const kw of sys.keywords) {
      if (hay.includes(kw)) score += kw.length > 4 ? 3 : 2
    }
    if (score > bestScore) {
      bestScore = score
      best = sys
    }
  }
  return best
}
