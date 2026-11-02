import { Injectable } from '@nestjs/common'
import { getPrismaClient } from '@mori/database'
import { estimatePrice, keepRetrievedIds, rankCatalogue, type CataloguePreference } from '@mori/domain'

export interface GroundedRecommendation {
  clarification: string | null
  provider: 'DISABLED'
  results: Array<{
    productId: string
    slug: string
    name: string
    isFixture: boolean
    score: number
    merchandiseVnd: string | null
  }>
}

@Injectable()
export class RecommendationService {
  async recommend(preference: CataloguePreference): Promise<GroundedRecommendation> {
    const products = await getPrismaClient().product.findMany({
      where: { state: 'ACTIVE' },
      include: {
        variants: {
          where: { availability: 'AVAILABLE', shape: { not: 'TRIFOLD' } },
          include: { priceRules: { where: { priceBook: { state: 'PUBLISHED' } } } },
        },
      },
    })
    const candidates = products.flatMap((product) =>
      product.variants.map((variant) => {
        const tiers = variant.priceRules.map((rule) => ({
          quantityMin: rule.quantityMin,
          quantityMax: rule.quantityMax,
          unitAmountVnd: rule.unitAmountVnd,
          setupAmountVnd: rule.setupAmountVnd,
        }))
        const matching = tiers.filter(
          (tier) => preference.quantity >= tier.quantityMin && preference.quantity <= tier.quantityMax,
        )
        const priced =
          matching.length === 1
            ? estimatePrice({
                quantity: preference.quantity,
                tiers,
                shippingVnd: null,
                taxVnd: null,
              })
            : null
        return {
          productId: product.id,
          productType: product.type,
          shape: variant.shape,
          styleTags: product.styleTags,
          colourTags: product.colourTags,
          available: true,
          merchandiseVnd: priced ? BigInt(priced.merchandiseVnd) : null,
        }
      }),
    )
    const ranked = rankCatalogue(preference, candidates)
    const allowed = keepRetrievedIds(
      candidates.map((candidate) => candidate.productId),
      ranked.results.map((result) => result.productId),
    )
    return {
      clarification: ranked.clarification,
      provider: 'DISABLED',
      results: ranked.results
        .filter((result) => allowed.includes(result.productId))
        .map((result) => {
          const product = products.find((item) => item.id === result.productId)
          return {
            productId: result.productId,
            slug: product?.slug ?? '',
            name: product?.name ?? '',
            isFixture: product?.isFixture ?? false,
            score: result.score,
            merchandiseVnd: result.merchandiseVnd === null ? null : result.merchandiseVnd.toString(),
          }
        }),
    }
  }
}
