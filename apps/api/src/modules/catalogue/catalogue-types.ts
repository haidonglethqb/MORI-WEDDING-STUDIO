export interface CatalogueDefinition {
  slug: string
  name: string
  description: string
  type: 'PAPER' | 'DIGITAL'
  shape?: 'FLAT' | 'BIFOLD'
  styleTags: string[]
  colourTags: string[]
  unitAmountVnd: bigint
  imageUrl: string | null
}
