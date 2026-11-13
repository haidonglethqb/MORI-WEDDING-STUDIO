export interface DigitalModelProfile {
  slug: string
  name: string
  style: 'editorial' | 'floral' | 'traditional' | 'minimalist' | 'typography'
  cardBg: string
  textColor: string
  accentColor: string
  borderColor: string
  motifType: string
  silhouette: 'arch' | 'standard' | 'deckle' | 'vellum'
  badge: string
}

export const ALL_30_MODELS: DigitalModelProfile[] = [
  // Editorial Vogue
  { slug: 'editorial-bifold-01', name: "L'Amour Vogue No. 1", style: 'editorial', cardBg: '#faf7f2', textColor: '#222720', accentColor: '#b38e46', borderColor: '#c5a059', motifType: 'arch-vogue', silhouette: 'arch', badge: 'Vogue Arch' },
  { slug: 'editorial-bifold-02', name: 'Le Grand Paris No. 2', style: 'editorial', cardBg: '#fbfbf9', textColor: '#1a1918', accentColor: '#b38e46', borderColor: '#333333', motifType: 'roman-vogue', silhouette: 'standard', badge: 'Roman XII' },
  { slug: 'editorial-flat-01', name: 'Haute Couture Élysée', style: 'editorial', cardBg: '#f7f4ee', textColor: '#2b2a26', accentColor: '#bfa063', borderColor: '#d2b57b', motifType: 'vellum-couture', silhouette: 'vellum', badge: 'Vellum Chic' },
  { slug: 'editorial-flat-02', name: 'Lumière Monogram', style: 'editorial', cardBg: '#fdfbf7', textColor: '#20261e', accentColor: '#967435', borderColor: '#b8924b', motifType: 'baroque-crest', silhouette: 'standard', badge: 'Baroque' },
  { slug: 'editorial-digital-01', name: 'Editorial Digital Atelier', style: 'editorial', cardBg: '#f6f3eb', textColor: '#1e241c', accentColor: '#b38e46', borderColor: '#cbb682', motifType: 'arch-vogue', silhouette: 'arch', badge: 'Editorial Mobile' },

  // Floral Botanical
  { slug: 'floral-bifold-01', name: 'Provence Magnolia', style: 'floral', cardBg: '#f9f8f4', textColor: '#283324', accentColor: '#4d6643', borderColor: '#738b68', motifType: 'magnolia-spray', silhouette: 'deckle', badge: 'Mộc Lan' },
  { slug: 'floral-bifold-02', name: 'Eucalyptus Morning', style: 'floral', cardBg: '#f6f7f3', textColor: '#253222', accentColor: '#3c5235', borderColor: '#6b8263', motifType: 'eucalyptus-twin', silhouette: 'standard', badge: 'Khuynh Diệp' },
  { slug: 'floral-flat-01', name: 'Wildflower Meadows', style: 'floral', cardBg: '#fbfaf6', textColor: '#2c3629', accentColor: '#5c7353', borderColor: '#879e7e', motifType: 'meadow-wildflowers', silhouette: 'standard', badge: 'Hoa Dại' },
  { slug: 'floral-flat-02', name: 'Botanical Laurel', style: 'floral', cardBg: '#f8f7f2', textColor: '#293326', accentColor: '#556a4c', borderColor: '#7a9171', motifType: 'laurel-wreath', silhouette: 'standard', badge: 'Nguyệt Quế' },
  { slug: 'floral-digital-01', name: 'Botanical Digital Garden', style: 'floral', cardBg: '#f3f6f1', textColor: '#202e1c', accentColor: '#4e6b43', borderColor: '#738f67', motifType: 'magnolia-spray', silhouette: 'deckle', badge: 'Thảo Mộc Số' },

  // Heritage Á Đông
  { slug: 'traditional-bifold-01', name: 'Song Hỷ Cung Đình', style: 'traditional', cardBg: '#6e1a18', textColor: '#fbf6ea', accentColor: '#ffd700', borderColor: '#d4af37', motifType: 'palace-joy', silhouette: 'standard', badge: 'Song Hỷ' },
  { slug: 'traditional-bifold-02', name: 'Phụng Vũ Loan Tường', style: 'traditional', cardBg: '#621514', textColor: '#fff8eb', accentColor: '#f7d36d', borderColor: '#e5c158', motifType: 'phoenix-gold', silhouette: 'standard', badge: 'Kim Phụng' },
  { slug: 'traditional-flat-01', name: 'Duyên Khởi Trăm Năm', style: 'traditional', cardBg: '#771e1c', textColor: '#fef7ec', accentColor: '#f0c761', borderColor: '#cca33d', motifType: 'lotus-heritage', silhouette: 'standard', badge: 'Liên Hoa' },
  { slug: 'traditional-flat-02', name: 'Kim Ngọc Mãn Đường', style: 'traditional', cardBg: '#681816', textColor: '#fff9ee', accentColor: '#ffd566', borderColor: '#dfb74a', motifType: 'cloud-wave', silhouette: 'standard', badge: 'Tường Vân' },
  { slug: 'traditional-digital-01', name: 'Heritage Digital Palace', style: 'traditional', cardBg: '#5c1412', textColor: '#fff6e5', accentColor: '#f5cb58', borderColor: '#c99f36', motifType: 'palace-joy', silhouette: 'standard', badge: 'Cung Đình Số' },

  // Minimalist Japandi
  { slug: 'minimalist-bifold-01', name: 'Komorebi Wabi-Sabi', style: 'minimalist', cardBg: '#f5f3ec', textColor: '#2d2c29', accentColor: '#787367', borderColor: '#b5aea1', motifType: 'zen-enso', silhouette: 'standard', badge: 'Ensō Zen' },
  { slug: 'minimalist-bifold-02', name: 'Muji Pure Essence', style: 'minimalist', cardBg: '#f7f6f1', textColor: '#292825', accentColor: '#963529', borderColor: '#a39c8e', motifType: 'muji-hanko', silhouette: 'standard', badge: 'Mori 森' },
  { slug: 'minimalist-flat-01', name: 'Kyoto Zen Stone', style: 'minimalist', cardBg: '#eeebe3', textColor: '#2f2e2a', accentColor: '#5a564e', borderColor: '#9e998e', motifType: 'stone-frame', silhouette: 'standard', badge: 'Zen Stone' },
  { slug: 'minimalist-flat-02', name: 'Sora Clean Horizon', style: 'minimalist', cardBg: '#f8f6f0', textColor: '#2b2a26', accentColor: '#736d62', borderColor: '#c2bcb0', motifType: 'horizon-arch', silhouette: 'arch', badge: 'Chân Trời' },
  { slug: 'minimalist-digital-01', name: 'Minimalist Digital Pure', style: 'minimalist', cardBg: '#f3f1ea', textColor: '#262522', accentColor: '#6e695d', borderColor: '#aba597', motifType: 'zen-enso', silhouette: 'standard', badge: 'Japandi Số' },

  // Modern Calligraphy
  { slug: 'typography-bifold-01', name: 'Florence Monogram', style: 'typography', cardBg: '#faf6f0', textColor: '#2b251f', accentColor: '#8a6138', borderColor: '#a67c52', motifType: 'florence-script', silhouette: 'deckle', badge: 'Florence' },
  { slug: 'typography-bifold-02', name: 'Serenade Italic', style: 'typography', cardBg: '#fcf8f3', textColor: '#2e231c', accentColor: '#7d4a2c', borderColor: '#9c6644', motifType: 'serenade-ribbon', silhouette: 'standard', badge: 'Serenade' },
  { slug: 'typography-flat-01', name: 'Artisan Letterpress', style: 'typography', cardBg: '#f8f5ed', textColor: '#261f19', accentColor: '#5c4025', borderColor: '#7a5a3a', motifType: 'artisan-press', silhouette: 'standard', badge: 'Chữ Chì' },
  { slug: 'typography-flat-02', name: 'Golden Script Swirl', style: 'typography', cardBg: '#fbf7ee', textColor: '#2b241d', accentColor: '#ab822e', borderColor: '#c99f48', motifType: 'golden-swirl', silhouette: 'standard', badge: 'Nhũ Vàng' },
  { slug: 'typography-digital-01', name: 'Calligraphy Digital Script', style: 'typography', cardBg: '#f8f4ec', textColor: '#27201a', accentColor: '#7a5430', borderColor: '#9a7046', motifType: 'florence-script', silhouette: 'deckle', badge: 'Thư Pháp Số' },
]

export function resolveModelProfile(slugOrModel: string): DigitalModelProfile {
  const match = ALL_30_MODELS.find((m) => m.slug === slugOrModel)
  if (match) return match

  const fallback = ALL_30_MODELS[0] as DigitalModelProfile
  if (slugOrModel.includes('traditional') || slugOrModel.includes('hy-su')) return ALL_30_MODELS[10] ?? fallback
  if (slugOrModel.includes('floral') || slugOrModel.includes('botanical')) return ALL_30_MODELS[5] ?? fallback
  if (slugOrModel.includes('minimalist') || slugOrModel.includes('wabi')) return ALL_30_MODELS[15] ?? fallback
  if (slugOrModel.includes('typography') || slugOrModel.includes('calligraphy') || slugOrModel.includes('modern')) {
    return ALL_30_MODELS[20] ?? fallback
  }
  return fallback
}
