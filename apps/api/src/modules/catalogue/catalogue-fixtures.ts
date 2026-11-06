import type { CatalogueProduct, CatalogueQuery } from '@mori/contracts'

interface FixtureRawItem {
  slug: string
  name: string
  style: string
  shape?: 'FLAT' | 'BIFOLD'
  type?: 'PAPER' | 'DIGITAL'
  priceVnd: string
}

const RAW_FIXTURES: FixtureRawItem[] = [
  // Editorial
  { slug: 'editorial-bifold-01', name: "L'Amour Vogue No. 1", style: 'editorial', shape: 'BIFOLD', priceVnd: '42000' },
  { slug: 'editorial-bifold-02', name: 'Le Grand Paris No. 2', style: 'editorial', shape: 'BIFOLD', priceVnd: '40000' },
  { slug: 'editorial-flat-01', name: 'Haute Couture Élysée', style: 'editorial', shape: 'FLAT', priceVnd: '32000' },
  { slug: 'editorial-flat-02', name: 'Lumière Monogram', style: 'editorial', shape: 'FLAT', priceVnd: '30000' },
  { slug: 'editorial-digital-01', name: 'Digital Vogue Luxe', style: 'editorial', type: 'DIGITAL', priceVnd: '0' },
  // Floral
  { slug: 'floral-bifold-01', name: 'Provence Magnolia', style: 'floral', shape: 'BIFOLD', priceVnd: '35000' },
  { slug: 'floral-bifold-02', name: 'Eucalyptus Morning', style: 'floral', shape: 'BIFOLD', priceVnd: '35000' },
  { slug: 'floral-flat-01', name: 'Wildflower Meadows', style: 'floral', shape: 'FLAT', priceVnd: '25000' },
  { slug: 'floral-flat-02', name: 'Botanical Laurel', style: 'floral', shape: 'FLAT', priceVnd: '25000' },
  { slug: 'floral-digital-01', name: 'Digital Floral Garden', style: 'floral', type: 'DIGITAL', priceVnd: '0' },
  // Traditional
  { slug: 'traditional-bifold-01', name: 'Song Hỷ Cung Đình', style: 'traditional', shape: 'BIFOLD', priceVnd: '38000' },
  { slug: 'traditional-bifold-02', name: 'Phụng Vũ Loan Tường', style: 'traditional', shape: 'BIFOLD', priceVnd: '38000' },
  { slug: 'traditional-flat-01', name: 'Duyên Khởi Trăm Năm', style: 'traditional', shape: 'FLAT', priceVnd: '28000' },
  { slug: 'traditional-flat-02', name: 'Kim Ngọc Mãn Đường', style: 'traditional', shape: 'FLAT', priceVnd: '28000' },
  { slug: 'traditional-digital-01', name: 'Digital Song Hỷ Hoàng Gia', style: 'traditional', type: 'DIGITAL', priceVnd: '0' },
  // Minimalist
  { slug: 'minimalist-bifold-01', name: 'Komorebi Wabi-Sabi', style: 'minimalist', shape: 'BIFOLD', priceVnd: '35000' },
  { slug: 'minimalist-bifold-02', name: 'Muji Pure Essence', style: 'minimalist', shape: 'BIFOLD', priceVnd: '35000' },
  { slug: 'minimalist-flat-01', name: 'Kyoto Zen Stone', style: 'minimalist', shape: 'FLAT', priceVnd: '25000' },
  { slug: 'minimalist-flat-02', name: 'Sora Clean Horizon', style: 'minimalist', shape: 'FLAT', priceVnd: '25000' },
  { slug: 'minimalist-digital-01', name: 'Digital Zen Minimal', style: 'minimalist', type: 'DIGITAL', priceVnd: '0' },
  // Typography
  { slug: 'typography-bifold-01', name: 'Florence Monogram', style: 'typography', shape: 'BIFOLD', priceVnd: '36000' },
  { slug: 'typography-bifold-02', name: 'Serenade Italic', style: 'typography', shape: 'BIFOLD', priceVnd: '36000' },
  { slug: 'typography-flat-01', name: 'Artisan Letterpress', style: 'typography', shape: 'FLAT', priceVnd: '26000' },
  { slug: 'typography-flat-02', name: 'Golden Script Swirl', style: 'typography', shape: 'FLAT', priceVnd: '26000' },
  { slug: 'typography-digital-01', name: 'Digital Calligraphy', style: 'typography', type: 'DIGITAL', priceVnd: '0' },
  // Modern
  { slug: 'modern-bifold-01', name: 'Nordic Arch Curves', style: 'modern', shape: 'BIFOLD', priceVnd: '36000' },
  { slug: 'modern-bifold-02', name: 'Avant-Garde Architectural', style: 'modern', shape: 'BIFOLD', priceVnd: '36000' },
  { slug: 'modern-flat-01', name: 'Celestial Halo', style: 'modern', shape: 'FLAT', priceVnd: '26000' },
  { slug: 'modern-flat-02', name: 'Prism Geometric', style: 'modern', shape: 'FLAT', priceVnd: '26000' },
  { slug: 'modern-digital-01', name: 'Digital Modern Luxe', style: 'modern', type: 'DIGITAL', priceVnd: '0' },
]

export function getFixtureCatalogue(query: CatalogueQuery): CatalogueProduct[] {
  return RAW_FIXTURES.filter((item) => {
    if (query.type && (item.type ?? 'PAPER') !== query.type) return false
    if (query.style && item.style !== query.style) return false
    if (query.shape && item.shape && item.shape !== query.shape) return false
    return true
  }).map((item, idx) => {
    const isPaper = (item.type ?? 'PAPER') === 'PAPER'
    const shape = item.shape ?? 'FLAT'
    return {
      slug: item.slug,
      name: item.name,
      type: item.type ?? 'PAPER',
      isFixture: true,
      styleTags: [item.style],
      variants: isPaper
        ? [
            {
              id: `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
              shape,
              availability: 'AVAILABLE' as const,
              unitAmountVnd: item.priceVnd,
            },
          ]
        : [],
    }
  })
}
