/**
 * Server-owned conversation memory & brief state reducer harness.
 * Implements fact patches, guest/suite separation, idempotency, and concurrency tokens.
 */

export interface TestWeddingBrief {
  coupleNames: string | null
  weddingDateIso: string | null
  location: string | null
  guestCount: number | null
  suiteQuantity: number | null
  venueCategory: string | null
  aestheticIdentity: string | null
  targetShape: 'FLAT' | 'BIFOLD' | null
  budgetVnd: string | null
  budgetBasis: 'TOTAL' | 'PER_CARD' | 'UNKNOWN' | null
  preferredFinishes: string[]
  avoidedStyles: string[]
  shortlistedProductSlugs: string[]
  lastDiscussedSlug: string | null
}

export type TestFactPatch =
  | { op: 'SET'; field: keyof TestWeddingBrief; value: unknown }
  | { op: 'CLEAR'; field: keyof TestWeddingBrief }
  | { op: 'ADD_TO_SET'; field: 'preferredFinishes' | 'avoidedStyles'; value: string }
  | { op: 'REMOVE_FROM_SET'; field: 'preferredFinishes' | 'avoidedStyles'; value: string }

export interface TestConversationSession {
  id: string
  ownerUserId: string | null
  guestDigest: string | null
  briefVersion: number
  brief: TestWeddingBrief
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  clientMessageIds: Set<string>
  quotaUsed: number
  maxQuota: number
}

export function createInitialTestBrief(): TestWeddingBrief {
  return {
    coupleNames: null,
    weddingDateIso: null,
    location: null,
    guestCount: null,
    suiteQuantity: null,
    venueCategory: null,
    aestheticIdentity: null,
    targetShape: null,
    budgetVnd: null,
    budgetBasis: null,
    preferredFinishes: [],
    avoidedStyles: [],
    shortlistedProductSlugs: [],
    lastDiscussedSlug: null,
  }
}

export function applyFactPatches(
  brief: TestWeddingBrief,
  patches: TestFactPatch[],
): TestWeddingBrief {
  const result: TestWeddingBrief = {
    ...brief,
    preferredFinishes: [...brief.preferredFinishes],
    avoidedStyles: [...brief.avoidedStyles],
    shortlistedProductSlugs: [...brief.shortlistedProductSlugs],
  }

  for (const patch of patches) {
    if (patch.op === 'SET') {
      ;(result as Record<string, unknown>)[patch.field] = patch.value
    } else if (patch.op === 'CLEAR') {
      ;(result as Record<string, unknown>)[patch.field] = null
    } else if (patch.op === 'ADD_TO_SET') {
      const set = new Set(result[patch.field])
      set.add(patch.value)
      result[patch.field] = Array.from(set)
    } else if (patch.op === 'REMOVE_FROM_SET') {
      result[patch.field] = result[patch.field].filter((item) => item !== patch.value)
    }
  }

  return result
}
