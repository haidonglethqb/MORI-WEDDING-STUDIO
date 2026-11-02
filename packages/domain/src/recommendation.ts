export type BudgetBasis = 'TOTAL' | 'PER_CARD' | 'UNKNOWN'

export interface CataloguePreference {
  productType: 'PAPER' | 'DIGITAL' | null
  shape: 'FLAT' | 'BIFOLD' | 'TRIFOLD' | null
  styles: string[]
  colours: string[]
  quantity: number
  budgetVnd: bigint | null
  budgetBasis: BudgetBasis
}

export interface CatalogueCandidate {
  productId: string
  productType: 'PAPER' | 'DIGITAL'
  shape: 'FLAT' | 'BIFOLD' | 'TRIFOLD'
  styleTags: string[]
  colourTags: string[]
  available: boolean
  merchandiseVnd: bigint | null
}

export interface RankedProduct {
  productId: string
  score: number
  merchandiseVnd: bigint | null
}

const WEIGHTS = { style: 40, budget: 30, colour: 20, shape: 10 }

export function rankCatalogue(preference: CataloguePreference, candidates: CatalogueCandidate[]): {
  clarification: string | null
  results: RankedProduct[]
} {
  if (preference.budgetVnd !== null && preference.budgetBasis === 'UNKNOWN') {
    return {
      clarification: 'Is that budget the total or the amount per card?',
      results: [],
    }
  }
  if (preference.shape === 'TRIFOLD') {
    return { clarification: 'Tri-fold is not available.', results: [] }
  }

  const eligible = candidates.filter((candidate) => {
    if (!candidate.available || candidate.shape === 'TRIFOLD') return false
    if (preference.productType && candidate.productType !== preference.productType) return false
    if (preference.shape && candidate.shape !== preference.shape) return false
    return true
  })

  const results = eligible
    .map((candidate) => ({
      productId: candidate.productId,
      merchandiseVnd: candidate.merchandiseVnd,
      score: scoreCandidate(preference, candidate),
    }))
    .sort((left, right) => right.score - left.score || left.productId.localeCompare(right.productId))

  return { clarification: null, results }
}

export function keepRetrievedIds(retrievedIds: string[], proposedIds: string[]): string[] {
  const allowed = new Set(retrievedIds)
  return proposedIds.filter((id) => allowed.has(id))
}

function scoreCandidate(preference: CataloguePreference, candidate: CatalogueCandidate): number {
  const style = overlap(preference.styles, candidate.styleTags)
  const colour = overlap(preference.colours, candidate.colourTags)
  const shape = preference.shape ? 1 : 1
  const budget = budgetFit(preference, candidate.merchandiseVnd)
  return style * WEIGHTS.style + budget * WEIGHTS.budget + colour * WEIGHTS.colour + shape * WEIGHTS.shape
}

function overlap(wanted: string[], tags: string[]): number {
  if (wanted.length === 0) return 1
  const found = wanted.filter((tag) => tags.includes(tag)).length
  return found / wanted.length
}

function budgetFit(preference: CataloguePreference, merchandiseVnd: bigint | null): number {
  if (preference.budgetVnd === null) return 1
  if (merchandiseVnd === null) return 0
  const budget =
    preference.budgetBasis === 'PER_CARD'
      ? preference.budgetVnd * BigInt(preference.quantity)
      : preference.budgetVnd
  if (merchandiseVnd <= budget) return 1
  const over = Number(merchandiseVnd - budget)
  const base = Number(budget)
  if (base <= 0) return 0
  return Math.max(0, 1 - over / base)
}
