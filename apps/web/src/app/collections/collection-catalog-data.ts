import { SECONDARY_PROFILES } from './collection-catalog-secondary'

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

const PRIMARY_PROFILES: Record<string, BespokeProductProfile> = {
  'editorial-bifold-01': {
    title: "L'Amour Vogue No. 1",
    subtitle: 'Dáng vòm Arch thanh thoát phong cách Vogue Paris',
    silhouette: 'arch',
    cardBg: '#faf7f2',
    borderColor: '#c5a059',
    accentColor: '#b38e46',
    motifType: 'arch-vogue',
  },
  'editorial-bifold-02': {
    title: 'Le Grand Paris No. 2',
    subtitle: 'Bố cục bất đối xứng hiện đại với số La Mã XII · XII',
    silhouette: 'standard',
    cardBg: '#fbfbf9',
    borderColor: '#2b2a27',
    accentColor: '#1a1918',
    motifType: 'roman-vogue',
  },
  'editorial-flat-01': {
    title: 'Haute Couture Élysée',
    subtitle: 'Lớp giấy can Vellum mờ và con dấu sáp champagne',
    silhouette: 'vellum',
    cardBg: '#f7f4ee',
    borderColor: '#d2b57b',
    accentColor: '#bfa063',
    motifType: 'vellum-couture',
  },
  'editorial-flat-02': {
    title: 'Lumière Monogram',
    subtitle: 'Khung viền Baroque đôi và phù điêu hoàng gia Pháp',
    silhouette: 'standard',
    cardBg: '#fdfbf7',
    borderColor: '#b8924b',
    accentColor: '#967435',
    motifType: 'baroque-crest',
  },
  'floral-bifold-01': {
    title: 'Provence Magnolia',
    subtitle: 'Cành hoa mộc lan uốn lượn mềm mại trên đỉnh thiệp',
    silhouette: 'deckle',
    cardBg: '#f9f8f4',
    borderColor: '#607855',
    accentColor: '#4d6643',
    motifType: 'magnolia-spray',
  },
  'floral-bifold-02': {
    title: 'Eucalyptus Morning',
    subtitle: 'Nhánh khuynh diệp vẽ tay ôm trọn hai bên tên cô dâu',
    silhouette: 'standard',
    cardBg: '#f6f7f3',
    borderColor: '#4d6345',
    accentColor: '#3c5235',
    motifType: 'eucalyptus-twin',
  },
  'floral-flat-01': {
    title: 'Wildflower Meadows',
    subtitle: 'Họa tiết hoa dại thảo mộc vươn lên từ chân thiệp',
    silhouette: 'standard',
    cardBg: '#fbfaf6',
    borderColor: '#7a8f71',
    accentColor: '#5c7353',
    motifType: 'meadow-wildflowers',
  },
  'floral-flat-02': {
    title: 'Botanical Laurel',
    subtitle: 'Vòng nguyệt quế tròn bao bọc biểu tượng chữ lồng',
    silhouette: 'standard',
    cardBg: '#f8f7f2',
    borderColor: '#6d8364',
    accentColor: '#556a4c',
    motifType: 'laurel-wreath',
  },
  'traditional-bifold-01': {
    title: 'Song Hỷ Cung Đình',
    subtitle: 'Sắc son chu sa hoàng gia và đại tự Song Hỷ mạ vàng 24K',
    silhouette: 'standard',
    cardBg: '#7c1f1d',
    borderColor: '#d4af37',
    accentColor: '#ffd700',
    motifType: 'palace-joy',
  },
  'traditional-bifold-02': {
    title: 'Phụng Vũ Loan Tường',
    subtitle: 'Chim Phụng ngậm hoa mẫu đơn dát vàng cát tường',
    silhouette: 'standard',
    cardBg: '#6a1816',
    borderColor: '#e5c158',
    accentColor: '#f7d36d',
    motifType: 'phoenix-gold',
  },
  'traditional-flat-01': {
    title: 'Duyên Khởi Trăm Năm',
    subtitle: 'Họa tiết liên hoa thanh khiết và triện son hoàng gia',
    silhouette: 'standard',
    cardBg: '#852422',
    borderColor: '#cca33d',
    accentColor: '#f0c761',
    motifType: 'lotus-heritage',
  },
  'traditional-flat-02': {
    title: 'Kim Ngọc Mãn Đường',
    subtitle: 'Thủy ba tường vân sóng nước hoàng tộc dát nhũ',
    silhouette: 'standard',
    cardBg: '#701c1a',
    borderColor: '#dfb74a',
    accentColor: '#ffd566',
    motifType: 'cloud-wave',
  },
}

export const BESPOKE_PROFILES: Record<string, BespokeProductProfile> = {
  ...PRIMARY_PROFILES,
  ...SECONDARY_PROFILES,
}

export function getBespokeProfile(slug: string): BespokeProductProfile | undefined {
  return BESPOKE_PROFILES[slug]
}
