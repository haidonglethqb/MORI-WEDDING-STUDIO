import { getPrismaClient } from '@mori/database'

interface SeedProduct {
  slug: string
  name: string
  type: 'PAPER' | 'DIGITAL'
  shape?: 'FLAT' | 'BIFOLD'
  style: string
  colour: string
}

const STYLES = ['minimalist', 'typography', 'floral', 'traditional', 'modern', 'editorial'] as const

function buildSeedList(): SeedProduct[] {
  const items: SeedProduct[] = []
  for (const style of STYLES) {
    // 2 flat paper per style = 12
    items.push({ slug: `${style}-flat-01`, name: `Mori ${style} Phẳng 1`, type: 'PAPER', shape: 'FLAT', style, colour: 'ivory' })
    items.push({ slug: `${style}-flat-02`, name: `Mori ${style} Phẳng 2`, type: 'PAPER', shape: 'FLAT', style, colour: 'terracotta' })
    // 2 bifold paper per style = 12
    items.push({ slug: `${style}-bifold-01`, name: `Mori ${style} Gấp 1`, type: 'PAPER', shape: 'BIFOLD', style, colour: 'olive' })
    items.push({ slug: `${style}-bifold-02`, name: `Mori ${style} Gấp 2`, type: 'PAPER', shape: 'BIFOLD', style, colour: 'sand' })
    // 1 digital per style = 6
    items.push({ slug: `${style}-digital-01`, name: `Thiệp Số ${style}`, type: 'DIGITAL', style, colour: 'warm-white' })
  }
  return items
}

export async function seedCatalogue(): Promise<void> {
  const prisma = getPrismaClient()
  const priceBook = await prisma.priceBook.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { state: 'PUBLISHED', isFixture: true, versionLabel: 'dev-2026-v1' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      versionLabel: 'dev-2026-v1',
      currency: 'VND',
      state: 'PUBLISHED',
      isFixture: true,
    },
  })

  const seeds = buildSeedList()
  for (const item of seeds) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        type: item.type,
        state: 'ACTIVE',
        isFixture: true,
        styleTags: [item.style],
        colourTags: [item.colour],
        description: `Mẫu thiết kế phong cách ${item.style} từ xưởng MORI`,
      },
      create: {
        slug: item.slug,
        name: item.name,
        type: item.type,
        state: 'ACTIVE',
        isFixture: true,
        styleTags: [item.style],
        colourTags: [item.colour],
        description: `Mẫu thiết kế phong cách ${item.style} từ xưởng MORI`,
      },
    })

    if (item.shape) {
      let variant = await prisma.productVariant.findFirst({
        where: { productId: product.id, shape: item.shape },
      })
      if (!variant) {
        variant = await prisma.productVariant.create({
          data: { productId: product.id, shape: item.shape, availability: 'AVAILABLE' },
        })
      }
      await prisma.priceRule.deleteMany({
        where: { priceBookId: priceBook.id, variantId: variant.id },
      })
      await prisma.priceRule.createMany({
        data: [
          { priceBookId: priceBook.id, variantId: variant.id, quantityMin: 1, quantityMax: 50, unitAmountVnd: 35_000n, setupAmountVnd: 0n },
          { priceBookId: priceBook.id, variantId: variant.id, quantityMin: 51, quantityMax: 100, unitAmountVnd: 30_000n, setupAmountVnd: 0n },
          { priceBookId: priceBook.id, variantId: variant.id, quantityMin: 101, quantityMax: 500, unitAmountVnd: 25_000n, setupAmountVnd: 0n },
        ],
      })
    }
  }
}
